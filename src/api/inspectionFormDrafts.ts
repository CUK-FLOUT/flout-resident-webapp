import { ApiError, http } from '@/lib/http';

interface FormDraftEnvelope<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
}

export interface InspectionFormDraft {
  draftId: string;
  assessmentId: number;
  applicationId: number | null;
  formState: 'EDITING' | 'LINKED';
  version: number;
  fields: Record<string, unknown>;
}

function readResult<T>(response: FormDraftEnvelope<T>): T {
  if (!response?.isSuccess || response.result == null)
    throw new ApiError(
      response?.isSuccess ? 502 : (response?.status ?? 502),
      response?.message || '임시 저장 정보를 확인할 수 없어요.',
      response?.code,
    );
  return response.result;
}

function readDraft(draft: InspectionFormDraft) {
  if (
    !draft ||
    typeof draft.draftId !== 'string' ||
    !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(draft.draftId) ||
    !Number.isSafeInteger(draft.assessmentId) ||
    draft.assessmentId <= 0 ||
    !Number.isSafeInteger(draft.version) ||
    draft.version < 0 ||
    !draft.fields ||
    typeof draft.fields !== 'object' ||
    Array.isArray(draft.fields) ||
    (draft.formState !== 'EDITING' && draft.formState !== 'LINKED') ||
    (draft.formState === 'LINKED' &&
      (draft.applicationId == null ||
        !Number.isSafeInteger(draft.applicationId) ||
        draft.applicationId <= 0))
  )
    throw new ApiError(502, '임시 저장 응답을 확인할 수 없어요.');
  return draft;
}

export async function listInspectionFormDrafts() {
  const result = readResult(
    await http.get<FormDraftEnvelope<{ drafts: InspectionFormDraft[] }>>(
      '/resident/applications/drafts',
    ),
  );
  if (!Array.isArray(result.drafts)) throw new ApiError(502, '임시 저장 목록을 확인할 수 없어요.');
  return result.drafts.map(readDraft);
}

export async function putInspectionFormDraft(
  draftId: string,
  assessmentId: number,
  version: number | null,
  fields: Record<string, unknown>,
) {
  const draft = readDraft(
    readResult(
      await http.put<FormDraftEnvelope<InspectionFormDraft>>(
        `/resident/application-form-drafts/${draftId}`,
        { assessmentId, version, fields },
      ),
    ),
  );
  if (
    draft.draftId !== draftId ||
    draft.assessmentId !== assessmentId ||
    draft.formState !== 'EDITING'
  )
    throw new ApiError(409, '작성 중인 신청서를 다시 확인해 주세요.');
  return draft;
}
