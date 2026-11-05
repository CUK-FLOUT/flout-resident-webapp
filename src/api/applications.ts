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
  Construction,
  CreateSupportApplicationInput,
  InspectionApplicationDetail,
  InspectionApplicationRequest,
  InspectionDraftResponse,
  InspectionReceipt,
  InspectionUploadResponse,
  InspectionResult,
  SupportApplicationInput,
  SupportApplicationResponse,
  SupportAttachmentResponse,
  SupportProgram,
  SupportProgress,
  SupportReview,
} from '@/types/domain';
import {
  fixedSupportPrograms,
  mockApplicationDetailFor,
  mockApplications,
  mockConstructionFor,
  mockInspectionApplicationFor,
  mockResult,
  mockSupportApplicationFor,
  mockSupportAttachmentFor,
  mockSupportProgress,
  mockSupportProgressFor,
  mockSupportReviewFor,
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

/**
 * 신청(접수번호) 1건을 중심으로 점검 → 결과 → 지원 → 시공이 이어집니다.
 * TODO(백엔드): 엔드포인트 경로는 가안입니다.
 */

/* ── STATUS-01 ~ 06 신청 내역 · 상세 ──────────────────────────────── */

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
          `/resident/inspection-applications/${applicationId}`,
        ),
      ),
  );
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
            requestedFacility: '출입구 물막이판',
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

export function useApplySupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupportApplicationInput) => {
      const form = new FormData();
      const { documents, ...rest } = input;
      form.append('request', new Blob([JSON.stringify(rest)], { type: 'application/json' }));
      documents.forEach((d) => form.append('documents', d));
      return withMock(
        () => mockSupportProgress,
        () => http.post<SupportProgress>(`/applications/${input.applicationId}/support`, form),
      );
    },
    onSuccess: (_, input) =>
      qc.invalidateQueries({ queryKey: queryKeys.application(input.applicationId) }),
  });
}

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

/** SUPPORT-07 임대인 동의서 · 주택 소유 증명서 제출 (04-6 / 04-7) */
export function useSubmitConsentFile(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return withMock(
        () => ({
          ...mockSupportProgressFor(applicationId),
          consent: 'SUBMITTED' as const,
          consentFile: { name: file.name, url: URL.createObjectURL(file) },
        }),
        () => http.post<SupportProgress>(`/applications/${applicationId}/support/consent`, form),
      );
    },
    // 응답(제출 후 상태)으로 바로 갱신 — 목업에서도 제출 완료 화면이 유지됩니다
    onSuccess: (progress) => qc.setQueryData(queryKeys.supportProgress(applicationId), progress),
  });
}

export function useConstruction(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.construction(applicationId ?? ''),
    queryFn: () =>
      withMock(
        () => mockConstructionFor(applicationId!),
        () => http.get<Construction>(`/applications/${applicationId}/construction`),
      ),
    enabled: Boolean(applicationId),
  });
}

/** CONSTRUCTION-07 주민 완료 확인 */
export function useConfirmConstructionComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      withMock<void>(
        () => undefined,
        () => http.post<void>(`/applications/${applicationId}/construction/confirm`),
      ),
    onSuccess: (_, applicationId) =>
      qc.invalidateQueries({ queryKey: queryKeys.application(applicationId) }),
  });
}
