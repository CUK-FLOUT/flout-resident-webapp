import { getInspectionReceipt, type useInspectionSubmission } from '@/api/applications';
import { env } from '@/lib/env';
import { ApiError } from '@/lib/http';
import {
  inspectionPhotoRequestKey,
  isInspectionReceived,
  samePhotos,
  step1Error,
  step2Error,
} from '@/lib/inspection';
import {
  inspectionFormFields,
  inspectionSessionScope,
  recoverInspectionCreation,
  rememberInspection,
  saveInspectionProgress,
} from '@/lib/inspectionForm';
import { useInspectionDraft, type Draft } from '@/stores/inspectionDraft';

async function uploadInspectionSubmissionPhotos(
  applicationId: number,
  assessmentId: string | number,
  files: File[],
  uploadPhotos: ReturnType<typeof useInspectionSubmission>['uploadPhotos'],
  isCurrent: () => boolean,
) {
  const state = useInspectionDraft.getState();
  const sameFiles = env.useMock && (await samePhotos(state.uploadedPhotos, files));
  const uploadKey = env.useMock
    ? sameFiles && state.uploadKey
      ? state.uploadKey
      : crypto.randomUUID()
    : await inspectionPhotoRequestKey(files);
  if (!isCurrent()) return;
  if (state.uploadKey && state.uploadKey !== uploadKey && (!env.useMock || state.uploadResult))
    throw new Error('이전 사진의 등록 상태를 확인해야 해요. 같은 사진으로 다시 시도해 주세요.');
  state.update({ uploadKey, uploadedPhotos: files });
  if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId, uploadKey);
  let uploaded = state.uploadResult;
  if (!uploaded) {
    try {
      uploaded = await uploadPhotos.mutateAsync({
        applicationId,
        files,
        requestKey: uploadKey,
      });
    } catch (failure) {
      if (
        isCurrent() &&
        failure instanceof ApiError &&
        (failure.code === 'APPLICATION_500_2' ||
          (failure.status >= 400 && failure.status < 500 && failure.status !== 409))
      ) {
        state.update({ uploadKey: '', uploadedPhotos: [] });
        if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId);
      }
      throw failure;
    }
  }
  if (!uploaded.inspectionId || !uploaded.attachments?.length)
    throw new Error('사진 등록 결과를 확인하지 못했어요.');
  if (!isCurrent()) return;
  state.update({ uploadResult: uploaded });
}

export async function submitInspection(
  context: NonNullable<Draft['context']>,
  { createDraft, updateMockDraft, uploadPhotos }: ReturnType<typeof useInspectionSubmission>,
  onComplete: (applicationId: number) => void,
) {
  const current = useInspectionDraft.getState();
  if (
    current.submitting ||
    current.context !== context ||
    current.sessionScope !== inspectionSessionScope()
  )
    return;
  const validation = step1Error(current) ?? step2Error(current);
  if (validation) throw new Error(validation);
  const assessmentId = current.assessmentId;
  if (
    assessmentId === undefined ||
    (!env.useMock &&
      (typeof assessmentId !== 'number' ||
        !Number.isSafeInteger(assessmentId) ||
        assessmentId <= 0))
  ) {
    throw new Error('실제 취약도 분석 ID가 아직 준비되지 않아 신청할 수 없어요.');
  }
  const { address } = context;
  if (
    !address.trim() ||
    address.length > 255 ||
    !context.detailAddress.trim() ||
    context.detailAddress.length > 255 ||
    !Number.isFinite(context.latitude) ||
    Math.abs(context.latitude) > 90 ||
    !Number.isFinite(context.longitude) ||
    Math.abs(context.longitude) > 180
  ) {
    throw new Error('주소와 좌표를 다시 확인해 주세요.');
  }
  const fields = inspectionFormFields(current);
  const payload = {
    ...fields,
    ...context,
    assessmentId,
    contact: fields.contact.trim(),
    applicantName: fields.applicantName.trim(),
    occupancyType: fields.occupancyType!,
    floodExperience: fields.floodExperience!,
    existingFacility: fields.existingFacility!,
    preferredTimeSlot: fields.preferredTimeSlot!,
    requestReason: fields.requestReason?.trim() || undefined,
  };
  const serialized = JSON.stringify(fields);
  const isCurrent = () =>
    useInspectionDraft.getState().context === context &&
    current.sessionScope === inspectionSessionScope();
  const complete = (applicationId: number) => {
    if (!isCurrent()) return;
    current.update({ savedApplicationId: applicationId, creationPending: false });
    if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId);
    onComplete(applicationId);
  };
  current.update({ submitting: true });
  try {
    let applicationId = current.savedApplicationId;
    if (
      !env.useMock &&
      typeof assessmentId === 'number' &&
      current.creationPending &&
      current.formId
    ) {
      const application = await recoverInspectionCreation(assessmentId, current.formId);
      if (!isCurrent()) return;
      if (application && isInspectionReceived(application.applicationStatus)) {
        complete(application.applicationId);
        return;
      }
      applicationId = application?.applicationId ?? applicationId;
      current.update({ savedApplicationId: applicationId, creationPending: false });
      if (applicationId) rememberInspection(assessmentId, applicationId);
    }
    if (!env.useMock && applicationId) {
      const receipt = await getInspectionReceipt(applicationId);
      if (!isCurrent()) return;
      if (isInspectionReceived(receipt.applicationStatus)) {
        complete(applicationId);
        return;
      }
      if (receipt.applicationStatus !== 'DRAFT')
        throw new Error('임시 저장 상태의 신청만 수정할 수 있어요.');
    }
    await saveInspectionProgress();
    if (!isCurrent()) return;
    if (!applicationId) {
      const formDraftId = useInspectionDraft.getState().formId ?? undefined;
      if (!env.useMock && !formDraftId) throw new Error('임시 저장된 신청서를 확인할 수 없어요.');
      if (!env.useMock) current.update({ creationPending: true });
      const created = await createDraft.mutateAsync({ input: payload, formDraftId });
      if (!Number.isSafeInteger(created.applicationId) || created.applicationId <= 0)
        throw new Error('임시 신청 상태를 확인하지 못했어요.');
      if (!isCurrent()) return;
      applicationId = created.applicationId;
      if (isInspectionReceived(created.status)) {
        complete(applicationId);
        return;
      }
      if (created.status !== 'DRAFT') throw new Error('임시 신청 상태를 확인하지 못했어요.');
      current.update({
        savedApplicationId: applicationId,
        savedPayload: serialized,
        creationPending: false,
      });
      if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId);
    } else if (env.useMock && current.savedPayload !== serialized) {
      await updateMockDraft.mutateAsync({ applicationId, input: payload });
      if (!isCurrent()) return;
      current.update({ savedPayload: serialized });
    }

    await uploadInspectionSubmissionPhotos(
      applicationId,
      assessmentId,
      current.photos,
      uploadPhotos,
      isCurrent,
    );
    if (!isCurrent()) return;
    const receipt = await getInspectionReceipt(applicationId);
    if (!isInspectionReceived(receipt.applicationStatus))
      throw new Error('아직 접수가 확인되지 않았어요. 다시 시도해 주세요.');
    complete(applicationId);
  } catch (failure) {
    if (
      isCurrent() &&
      failure instanceof ApiError &&
      failure.status >= 400 &&
      failure.status < 500 &&
      failure.status !== 409
    )
      current.update({ creationPending: false });
    throw failure;
  } finally {
    if (isCurrent()) current.update({ submitting: false });
  }
}
