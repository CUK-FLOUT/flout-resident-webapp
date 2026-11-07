import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { env } from '@/lib/env';
import {
  createMockInspection,
  getMockInspection,
  updateMockInspection,
  uploadMockInspection,
} from '@/api/inspectionMock';
import type {
  ApplicationDetail,
  ApplicationSummary,
  ConstructionResult,
  ConstructionSchedule,
  CreateSupportApplicationInput,
  InspectionApplicationDetail,
  InspectionApplicationRequest,
  InspectionDraftResponse,
  InspectionReceipt,
  InspectionUploadResponse,
  InspectionResult,
  RecommendedFacilities,
  SupportApplicationResponse,
  SupportApproval,
  SupportAttachmentResponse,
  SupportProgram,
  SupportProgress,
  SupportRejection,
  SupportReview,
  SupportSchedule,
} from '@/types/domain';
import {
  fixedSupportPrograms,
  mockApplicationDetailFor,
  mockApplications,
  mockConstructionResultFor,
  mockInspectionApplicationFor,
  mockRecommendedFacilitiesFor,
  mockResult,
  mockSupportApplicationFor,
  mockSupportApprovalFor,
  mockSupportAttachmentFor,
  mockSupportProgressFor,
  mockSupportRejectionFor,
  mockSupportReviewFor,
  mockSupportScheduleFor,
} from './mocks';
import { queryKeys, withMock } from './queryClient';

type InspectionInput = Omit<InspectionApplicationRequest, 'assessmentId'> & {
  assessmentId: number | string;
};
interface InspectionEnvelope<T> {
  isSuccess: boolean;
  message: string;
  result: T;
}
function unwrapInspection<T>(envelope: InspectionEnvelope<T>): T {
  if (!envelope?.isSuccess || envelope.result == null)
    throw new Error(envelope?.message || '신청 정보를 처리하지 못했어요.');
  return envelope.result;
}
export async function createInspectionDraft(
  input: InspectionInput,
): Promise<InspectionDraftResponse> {
  if (env.useMock)
    return createMockInspection({ ...input, assessmentId: String(input.assessmentId) });
  if (
    typeof input.assessmentId !== 'number' ||
    !Number.isSafeInteger(input.assessmentId) ||
    input.assessmentId <= 0
  )
    throw new Error('실제 취약도 분석 결과가 준비되지 않아 신청할 수 없어요.');
  return unwrapInspection(
    await http.post<InspectionEnvelope<InspectionDraftResponse>>('/resident/applications', input),
  );
}
export async function uploadInspectionPhotos(
  applicationId: number,
  files: File[],
  requestKey: string,
): Promise<InspectionUploadResponse> {
  if (env.useMock) return uploadMockInspection(applicationId, files, requestKey);
  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  return unwrapInspection(
    await http.post<InspectionEnvelope<InspectionUploadResponse>>(
      `/resident/applications/${applicationId}/attachments`,
      form,
      { headers: { 'Idempotency-Key': requestKey } },
    ),
  );
}
export async function getInspectionReceipt(applicationId: number): Promise<InspectionReceipt> {
  if (env.useMock) return getMockInspection(applicationId);
  return unwrapInspection(
    await http.get<InspectionEnvelope<InspectionReceipt>>(
      `/resident/applications/${applicationId}`,
    ),
  );
}

export function useInspectionSubmission() {
  const createDraft = useMutation({ mutationFn: createInspectionDraft });
  const updateMockDraft = useMutation({
    mutationFn: ({ applicationId, input }: { applicationId: number; input: InspectionInput }) => {
      if (!env.useMock) throw new Error('임시 신청 수정 API가 아직 준비되지 않았어요.');
      return updateMockInspection(applicationId, {
        ...input,
        assessmentId: String(input.assessmentId),
      });
    },
  });
  const uploadPhotos = useMutation({
    mutationFn: ({
      applicationId,
      files,
      requestKey,
    }: {
      applicationId: number;
      files: File[];
      requestKey: string;
    }) => uploadInspectionPhotos(applicationId, files, requestKey),
  });
  return { createDraft, updateMockDraft, uploadPhotos };
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications(),
    queryFn: () =>
      withMock(
        () => (new URLSearchParams(location.search).has('empty') ? [] : mockApplications),
        () => http.get<ApplicationSummary[]>('/applications'),
      ),
  });
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.application(id ?? ''),
    queryFn: () =>
      withMock(
        () => mockApplicationDetailFor(id!),
        () => http.get<ApplicationDetail>(`/applications/${id}`),
      ),
    enabled: Boolean(id),
  });
}

/* ── RESULT-01 ~ 08 점검 결과 · 맞춤 예방안 ───────────────────────── */

export function useInspectionResult(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.result(applicationId ?? ''),
    queryFn: () =>
      withMock(
        () => mockResult,
        () => http.get<InspectionResult>(`/applications/${applicationId}/result`),
      ),
    enabled: Boolean(applicationId),
  });
}

/* ── SUPPORT-01 ~ 09 지원 안내 · 신청 ─────────────────────────────── */

export function useSupportPrograms(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.supportPrograms(applicationId ?? ''),
    queryFn: () =>
      withMock<SupportProgram[]>(
        () => fixedSupportPrograms,
        async () => fixedSupportPrograms,
      ),
    enabled: Boolean(applicationId),
  });
}

export function getInspectionApplication(applicationId: string) {
  return withMock(
    () => mockInspectionApplicationFor(applicationId),
    async () =>
      unwrapInspection(
        await http.get<InspectionEnvelope<InspectionApplicationDetail>>(
          `/resident/applications/${applicationId}`,
        ),
      ),
  );
}

export function getRecommendedFacilities(applicationId: string) {
  return withMock(
    () => mockRecommendedFacilitiesFor(applicationId),
    async () =>
      unwrapInspection(
        await http.get<InspectionEnvelope<RecommendedFacilities>>(
          `/resident/applications/${applicationId}/recommended-facilities`,
        ),
      ),
  );
}

export function useInspectionApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inspectionApplication(applicationId ?? ''),
    queryFn: () => getInspectionApplication(applicationId!),
    enabled: Boolean(applicationId),
  });
}

export function useRecommendedFacilities(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recommendedFacilities(applicationId ?? ''),
    queryFn: () => getRecommendedFacilities(applicationId!),
    enabled: Boolean(applicationId),
  });
}

export function createSupportApplication(input: CreateSupportApplicationInput) {
  return withMock(
    () => mockSupportApplicationFor(input.applicationId, input.programId),
    async () =>
      unwrapInspection(
        await http.post<InspectionEnvelope<SupportApplicationResponse>>(
          '/resident/support-applications',
          {
            ...input,
            preferredVisitTime:
              input.preferredVisitTime === 'ANYTIME' ? 'ANY' : input.preferredVisitTime,
          },
        ),
      ),
  );
}

export function uploadSupportAttachment(supportApplicationId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return withMock(
    () => mockSupportAttachmentFor(supportApplicationId, file),
    async () =>
      unwrapInspection(
        await http.post<InspectionEnvelope<SupportAttachmentResponse>>(
          `/resident/support-applications/${supportApplicationId}/attachments`,
          form,
        ),
      ),
  );
}

export function useSubmitSupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      supportApplicationId,
      file,
      onCreated,
    }: {
      input: CreateSupportApplicationInput;
      supportApplicationId?: number;
      file: File | null;
      onCreated: (supportApplicationId: number) => void;
    }) => {
      let id = supportApplicationId;
      if (!id) {
        id = (await createSupportApplication(input)).supportApplicationId;
        onCreated(id);
      }
      if (file) await uploadSupportAttachment(id, file);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.applications() }),
  });
}

export function getSupportReview(supportApplicationId: number) {
  return withMock(
    () => mockSupportReviewFor(supportApplicationId),
    async () =>
      unwrapInspection(
        await http.get<InspectionEnvelope<SupportReview>>(
          `/resident/support-applications/${supportApplicationId}/review`,
        ),
      ),
  );
}

export function useSupportReview(supportApplicationId: number) {
  return useQuery({
    queryKey: queryKeys.supportReview(supportApplicationId),
    queryFn: () => getSupportReview(supportApplicationId),
    enabled: Boolean(supportApplicationId),
  });
}

function useSupportDetail<T>(
  supportApplicationId: number,
  detail: 'approval' | 'rejection' | 'schedule',
  mock: () => T,
) {
  return useQuery({
    queryKey: queryKeys.supportDetail(supportApplicationId, detail),
    queryFn: () =>
      withMock(mock, async () =>
        unwrapInspection(
          await http.get<InspectionEnvelope<T>>(
            `/resident/support-applications/${supportApplicationId}/${detail}`,
          ),
        ),
      ),
    enabled: Boolean(supportApplicationId),
  });
}

export const useSupportApproval = (id: number) =>
  useSupportDetail<SupportApproval>(id, 'approval', () => mockSupportApprovalFor(id));

export const useSupportRejection = (id: number) =>
  useSupportDetail<SupportRejection>(id, 'rejection', () => mockSupportRejectionFor(id));

export const useSupportSchedule = (id: number) =>
  useSupportDetail<SupportSchedule>(id, 'schedule', () => mockSupportScheduleFor(id));

/* ── CONSTRUCTION-01 ~ 07 지원 · 시공 진행 ────────────────────────── */

export function useSupportProgress(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.supportProgress(applicationId ?? ''),
    queryFn: () =>
      withMock(
        () => mockSupportProgressFor(applicationId!),
        () => http.get<SupportProgress>(`/applications/${applicationId}/support`),
      ),
    enabled: Boolean(applicationId),
  });
}

function useConstructionDetail<T>(
  constructionId: number,
  detail: 'result' | 'schedule',
  mock: () => T,
) {
  return useQuery({
    queryKey: queryKeys.constructionDetail(constructionId, detail),
    queryFn: () =>
      withMock(mock, async () =>
        unwrapInspection(
          await http.get<InspectionEnvelope<T>>(
            `/resident/constructions/${constructionId}${detail === 'schedule' ? '/schedule' : ''}`,
          ),
        ),
      ),
    enabled: Boolean(constructionId),
  });
}

export const useConstructionSchedule = (id: number) =>
  useConstructionDetail<ConstructionSchedule>(id, 'schedule', () => mockConstructionResultFor(id));

export const useConstructionResult = (id: number) =>
  useConstructionDetail<ConstructionResult>(id, 'result', () => mockConstructionResultFor(id));
