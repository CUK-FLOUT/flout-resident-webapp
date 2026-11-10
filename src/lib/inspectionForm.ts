import {
  getInspectionApplication,
  getInspectionReceipt,
  updateInspectionDraft,
} from '@/api/applications';
import { listInspectionFormDrafts, putInspectionFormDraft } from '@/api/inspectionFormDrafts';
import { getAddressCoordinates } from '@/api/risk';
import { getRiskAssessment, type AnalysisResult } from '@/api/riskAnalysis';
import { getPrimaryAddress } from '@/lib/address';
import { env } from '@/lib/env';
import { ApiError } from '@/lib/http';
import { formatInspectionPhone, step1Error, visitScheduleError } from '@/lib/inspection';
import { tokenStorage } from '@/lib/storage';
import { useInspectionDraft, type Draft } from '@/stores/inspectionDraft';

const resumeKey = 'flout.inspectionResume';

export function inspectionSessionScope() {
  const session = tokenStorage.readSession();
  return env.useMock ? 'mock' : (session?.id ?? session?.accessToken ?? null);
}

function readResume() {
  const id = tokenStorage.readSession()?.id;
  if (!id) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(resumeKey) ?? 'null') as {
      sessionId: string;
      assessmentId: number;
      applicationId: number | null;
      uploadKey?: string;
    } | null;
    return value?.sessionId === id && Number.isSafeInteger(value.assessmentId) ? value : null;
  } catch {
    return null;
  }
}

export function rememberInspection(
  assessmentId: number,
  applicationId: number | null,
  uploadKey?: string,
) {
  const sessionId = tokenStorage.readSession()?.id;
  if (!sessionId || env.useMock) return;
  try {
    sessionStorage.setItem(
      resumeKey,
      JSON.stringify({ sessionId, assessmentId, applicationId, uploadKey }),
    );
  } catch {
    return;
  }
}

export function forgetInspection(assessmentId: string | number) {
  if (readResume()?.assessmentId !== assessmentId) return;
  try {
    sessionStorage.removeItem(resumeKey);
  } catch {
    return;
  }
}

export function inspectionFormFields(draft: Draft) {
  return {
    applicantName: draft.applicantName,
    contact: draft.phone,
    occupancyType: draft.tenure === 'OTHER' ? ('ETC' as const) : draft.tenure,
    floodExperience: draft.floodExperience,
    existingFacility: draft.facilityInstalled,
    requestReason: draft.reason || null,
    preferredVisitDate: draft.preferredDate,
    preferredTimeSlot:
      draft.preferredTimeSlot === 'ANYTIME' ? ('ANY' as const) : draft.preferredTimeSlot,
    inflowLocations: draft.waterEntryPoints.map((value) =>
      value === 'OTHER' ? ('ETC' as const) : value,
    ),
  };
}

function restoreFields(fields: Record<string, unknown>): Partial<Draft> {
  const text = (value: unknown) => (typeof value === 'string' ? value : '');
  const { occupancyType, floodExperience, existingFacility, preferredTimeSlot, inflowLocations } =
    fields;
  return {
    applicantName: text(fields.applicantName),
    phone: formatInspectionPhone(text(fields.contact)),
    tenure:
      occupancyType === 'ETC'
        ? 'OTHER'
        : occupancyType === 'OWNER' || occupancyType === 'TENANT'
          ? occupancyType
          : null,
    floodExperience:
      floodExperience === 'YES' || floodExperience === 'NO' || floodExperience === 'UNKNOWN'
        ? floodExperience
        : null,
    facilityInstalled: typeof existingFacility === 'boolean' ? existingFacility : null,
    reason: text(fields.requestReason),
    preferredDate: text(fields.preferredVisitDate),
    preferredTimeSlot:
      preferredTimeSlot === 'ANY'
        ? 'ANYTIME'
        : preferredTimeSlot === 'MORNING' || preferredTimeSlot === 'AFTERNOON'
          ? preferredTimeSlot
          : null,
    waterEntryPoints: Array.isArray(inflowLocations)
      ? inflowLocations.flatMap((value) => {
          switch (value) {
            case 'ETC':
              return ['OTHER' as const];
            case 'WINDOW':
            case 'ENTRANCE':
            case 'BATHROOM':
            case 'DRAIN':
            case 'UNKNOWN':
              return [value as Draft['waterEntryPoints'][number]];
            default:
              return [];
          }
        })
      : [],
  };
}

type InspectionEntry =
  { draft: Partial<Draft> } | { completed: number; assessmentId: number | undefined } | null;

export async function loadInspectionEntry(
  result: AnalysisResult | null,
  scope: string | null,
  requestedApplicationId?: number,
): Promise<InspectionEntry> {
  const initialContext = result
    ? {
        address: getPrimaryAddress(result.input.address).trim(),
        detailAddress: result.input.detail.trim(),
        ...result.input.coordinates,
      }
    : null;
  if (env.useMock)
    return result
      ? { draft: { assessmentId: result.id, context: initialContext, sessionScope: scope } }
      : null;
  if (!scope) return null;

  const resume = readResume();
  const drafts = await listInspectionFormDrafts();
  const requested = requestedApplicationId ?? (!result ? resume?.applicationId : null);
  const assessmentToResume = result?.id ?? resume?.assessmentId;
  const saved = requested
    ? drafts.find((item) => item.applicationId === requested)
    : assessmentToResume !== undefined
      ? drafts.find((item) => item.assessmentId === assessmentToResume)
      : drafts[0];

  if (!saved && requested) {
    const receipt = await getInspectionReceipt(requested);
    if (
      receipt.applicationStatus === 'RECEIVED' ||
      receipt.applicationStatus === 'INSPECTION_COMPLETED'
    )
      return { completed: receipt.applicationId, assessmentId: resume?.assessmentId };
    throw new ApiError(409, '이어 쓸 수 있는 임시 신청서를 찾을 수 없어요.');
  }

  const assessmentId = saved?.assessmentId ?? assessmentToResume;
  if (typeof assessmentId !== 'number') return null;
  const application = saved?.applicationId
    ? await getInspectionApplication(saved.applicationId)
    : null;
  if (
    application?.applicationStatus === 'RECEIVED' ||
    application?.applicationStatus === 'INSPECTION_COMPLETED'
  )
    return { completed: application.applicationId, assessmentId };
  if (application && application.applicationStatus !== 'DRAFT')
    throw new ApiError(409, '임시 저장 상태의 신청만 수정할 수 있어요.');

  let context = result?.id === assessmentId ? initialContext : null;
  if (
    !context ||
    (application &&
      (context.address !== application.address ||
        context.detailAddress !== application.detailAddress))
  ) {
    const analysis = application ?? (await getRiskAssessment(assessmentId));
    if ('status' in analysis && analysis.status !== 'COMPLETED')
      throw new ApiError(409, '완료된 취약도 분석 결과가 필요해요.');
    const address = analysis.address.trim();
    const detailAddress = analysis.detailAddress?.trim();
    if (!address || !detailAddress) throw new ApiError(409, '신청 주소를 다시 확인해 주세요.');
    context = { address, detailAddress, ...(await getAddressCoordinates(address)) };
  }
  const fields = application
    ? {
        ...application,
        applicantName: application.applicant.name,
        contact: application.applicant.phone,
      }
    : (saved?.fields ?? {});
  return {
    draft: {
      ...restoreFields(fields),
      sessionScope: scope,
      assessmentId,
      context,
      formId: saved?.draftId ?? null,
      formVersion: saved?.version ?? null,
      savedApplicationId: application?.applicationId ?? null,
      uploadKey:
        application && resume?.applicationId === application.applicationId
          ? (resume.uploadKey ?? '')
          : '',
    },
  };
}

const saves = new WeakMap<NonNullable<Draft['context']>, Promise<void>>();

export async function saveInspectionProgress(): Promise<void> {
  const draft = useInspectionDraft.getState();
  const { context, assessmentId } = draft;
  if (
    env.useMock ||
    !context ||
    typeof assessmentId !== 'number' ||
    draft.sessionScope !== inspectionSessionScope()
  )
    return;
  const inFlight = saves.get(context);
  if (inFlight) {
    await inFlight;
    if (useInspectionDraft.getState().context === context) await saveInspectionProgress();
    return;
  }
  const fields = inspectionFormFields(draft);
  const snapshot = JSON.stringify(fields);
  if (draft.creationPending || draft.uploadResult) return;
  const current = () =>
    useInspectionDraft.getState().context === context &&
    draft.sessionScope === inspectionSessionScope();
  const task = async () => {
    if (draft.savedApplicationId) {
      if (draft.savedPayload === snapshot || step1Error(draft) || visitScheduleError(draft)) return;
      await updateInspectionDraft(draft.savedApplicationId, {
        ...fields,
        applicantName: fields.applicantName.trim(),
        occupancyType: fields.occupancyType!,
        floodExperience: fields.floodExperience!,
        existingFacility: fields.existingFacility!,
        preferredTimeSlot: fields.preferredTimeSlot!,
        requestReason: fields.requestReason?.trim() || null,
      });
      if (current()) draft.update({ savedPayload: snapshot });
      return;
    }
    if (draft.formSnapshot === snapshot) return;
    const formId = draft.formId ?? crypto.randomUUID();
    if (!draft.formId) draft.update({ formId });
    let saved;
    try {
      saved = await putInspectionFormDraft(formId, assessmentId, draft.formVersion, fields);
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        (error.status !== 409 && error.status !== 0 && error.status < 500)
      )
        throw error;
      const matching = (await listInspectionFormDrafts()).find(
        (item) => item.draftId === formId && item.assessmentId === assessmentId,
      );
      const sameFields =
        matching &&
        Object.entries(fields).every(
          ([key, value]) => JSON.stringify(matching.fields[key]) === JSON.stringify(value),
        );
      if (!matching || matching.formState !== 'EDITING' || !sameFields) throw error;
      saved = matching;
    }
    if (current()) draft.update({ formVersion: saved.version, formSnapshot: snapshot });
  };
  const saving = task();
  saves.set(context, saving);
  try {
    await saving;
  } finally {
    saves.delete(context);
  }
}

export async function recoverInspectionCreation(assessmentId: number, draftId: string) {
  const forms = await listInspectionFormDrafts();
  const form = forms.find((item) => item.draftId === draftId && item.assessmentId === assessmentId);
  if (form?.applicationId) return getInspectionApplication(form.applicationId);
  if (form?.formState !== 'EDITING')
    throw new ApiError(409, '기존 신청의 접수 상태를 다시 확인해 주세요.');
  return null;
}
