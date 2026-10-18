import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import type {
  ApplicationDetail,
  ApplicationSummary,
  Construction,
  InspectionRequestInput,
  InspectionResult,
  SupportApplicationInput,
  SupportProgram,
  SupportProgress,
} from '@/types/domain';
import {
  mockApplicationDetail,
  mockApplications,
  mockConstruction,
  mockResult,
  mockSupportPrograms,
  mockSupportProgress,
} from './mocks';
import { queryKeys, withMock } from './queryClient';

/**
 * 신청(접수번호) 1건을 중심으로 점검 → 결과 → 지원 → 시공이 이어집니다.
 * TODO(백엔드): 엔드포인트 경로는 가안입니다.
 */

/* ── INSPECTION-07 현장점검 신청 제출 ─────────────────────────────── */

export async function createInspectionRequest(input: InspectionRequestInput) {
  const form = new FormData();
  const { photos, ...rest } = input;
  form.append('request', new Blob([JSON.stringify(rest)], { type: 'application/json' }));
  photos.forEach((p) => form.append('photos', p));

  return withMock(
    () => ({ ...mockApplications[0], createdAt: new Date().toISOString() }),
    () => http.post<ApplicationSummary>('/inspection-requests', form),
  );
}

export function useCreateInspectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInspectionRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.applications() }),
  });
}

/* ── STATUS-01 ~ 06 신청 내역 · 상세 ──────────────────────────────── */

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications(),
    queryFn: () =>
      withMock(
        () => mockApplications,
        () => http.get<ApplicationSummary[]>('/applications'),
      ),
  });
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.application(id ?? ''),
    queryFn: () =>
      withMock(
        () => ({ ...mockApplicationDetail, id: id! }),
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
      withMock(
        () => mockSupportPrograms,
        () => http.get<SupportProgram[]>(`/applications/${applicationId}/support-programs`),
      ),
    enabled: Boolean(applicationId),
  });
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
        () => mockSupportProgress,
        () => http.get<SupportProgress>(`/applications/${applicationId}/support`),
      ),
    enabled: Boolean(applicationId),
  });
}

export function useConstruction(applicationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.construction(applicationId ?? ''),
    queryFn: () =>
      withMock(
        () => mockConstruction,
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
