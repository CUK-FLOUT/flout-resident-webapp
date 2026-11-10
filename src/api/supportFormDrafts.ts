import { ApiError, http } from '@/lib/http';

interface FormDraftEnvelope<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
}

export interface SupportFormDraft {
  draftId: string;
  applicationId: number;
  formState: 'EDITING' | 'LINKED';
  supportApplicationId: number | null;
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

function readDraft(draft: SupportFormDraft) {
  if (
    !draft ||
    typeof draft.draftId !== 'string' ||
    !Number.isSafeInteger(draft.applicationId) ||
    !Number.isSafeInteger(draft.version) ||
    !draft.fields ||
    typeof draft.fields !== 'object' ||
    Array.isArray(draft.fields) ||
    (draft.formState !== 'EDITING' && draft.formState !== 'LINKED')
  )
    throw new ApiError(502, '임시 저장 응답을 확인할 수 없어요.');
  return draft;
}

export async function listSupportFormDrafts() {
  const result = readResult(
    await http.get<FormDraftEnvelope<{ drafts: SupportFormDraft[] }>>(
      '/resident/support-applications/drafts',
    ),
  );
  if (!Array.isArray(result.drafts)) throw new ApiError(502, '임시 저장 목록을 확인할 수 없어요.');
  return result.drafts.map(readDraft);
}

export async function putSupportFormDraft(
  draftId: string,
  applicationId: number,
  version: number | null,
  fields: Record<string, unknown>,
) {
  return readDraft(
    readResult(
      await http.put<FormDraftEnvelope<SupportFormDraft>>(
        `/resident/support-form-drafts/${draftId}`,
        { applicationId, version, fields },
      ),
    ),
  );
}
