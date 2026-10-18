import { useMutation, useQuery } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { http } from '@/lib/http';
import type {
  AddressCandidate,
  PreventionGuide,
  RiskAssessment,
  UnresolvedReason,
} from '@/types/domain';
import { mockAddresses, mockAssessmentHigh, mockAssessmentLow, mockGuide } from './mocks';
import { queryKeys, withMock } from './queryClient';

/* ── RISK-01 주소 검색 ──────────────────────────────────────────────
 * 행정안전부 도로명주소 검색 API (business.juso.go.kr) 를 직접 호출합니다.
 * 승인키는 VITE_JUSO_API_KEY. 운영 도메인 등록이 필요하며, CORS가 막히면 백엔드 프록시로 옮기세요.
 */
interface JusoResponse {
  results: {
    common: { errorCode: string; errorMessage: string };
    juso:
      | { roadAddr: string; jibunAddr: string; zipNo: string; bdNm: string; bdMgtSn: string }[]
      | null;
  };
}

export async function searchAddress(keyword: string): Promise<AddressCandidate[]> {
  if (env.useMock || !env.jusoApiKey) {
    return withMock(
      () => mockAddresses.filter((a) => a.roadAddress.includes(keyword) || keyword.length < 2),
      async () => [],
    );
  }
  const url = new URL('https://business.juso.go.kr/addrlink/addrLinkApi.do');
  url.search = new URLSearchParams({
    confmKey: env.jusoApiKey,
    keyword,
    currentPage: '1',
    countPerPage: '10',
    resultType: 'json',
  }).toString();

  const res = (await (await fetch(url)).json()) as JusoResponse;
  if (res.results.common.errorCode !== '0') throw new Error(res.results.common.errorMessage);
  return (res.results.juso ?? []).map((j) => ({
    roadAddress: j.roadAddr,
    jibunAddress: j.jibunAddr,
    zipCode: j.zipNo,
    buildingName: j.bdNm || undefined,
    buildingManagementNo: j.bdMgtSn,
  }));
}

export function useAddressSearch(keyword: string) {
  return useQuery({
    queryKey: queryKeys.address(keyword),
    queryFn: () => searchAddress(keyword),
    enabled: keyword.trim().length >= 2,
    staleTime: 5 * 60_000,
  });
}

/* ── RISK-02~06 취약도 분석 요청 · 결과 조회 ─────────────────────── */

// TODO(백엔드): 엔드포인트 확정 후 경로 수정
export const createAssessment = (address: AddressCandidate) =>
  withMock(
    () => (address.roadAddress.includes('소사') ? mockAssessmentLow : mockAssessmentHigh),
    () =>
      http.post<RiskAssessment>('/risk-assessments', {
        buildingManagementNo: address.buildingManagementNo,
      }),
  );

export function useCreateAssessment() {
  return useMutation({ mutationFn: createAssessment });
}

export const getAssessment = (id: string) =>
  withMock(
    () => (id === mockAssessmentLow.id ? mockAssessmentLow : mockAssessmentHigh),
    () => http.get<RiskAssessment>(`/risk-assessments/${id}`),
  );

export function useAssessment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assessment(id ?? ''),
    queryFn: () => getAssessment(id!),
    enabled: Boolean(id),
  });
}

/* ── RISK-07 예방 가이드 (취약도 낮음 플로우) ─────────────────────── */

export const getGuide = (assessmentId: string) =>
  withMock(
    () => mockGuide,
    () => http.get<PreventionGuide>(`/risk-assessments/${assessmentId}/guide`),
  );

export function useGuide(assessmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.guide(assessmentId ?? ''),
    queryFn: () => getGuide(assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

export const reportGuideOutcome = (input: {
  guideId: string;
  resolved: boolean;
  reasons?: UnresolvedReason[];
}) =>
  withMock<void>(
    () => undefined,
    () => http.post<void>(`/guides/${input.guideId}/outcome`, input),
  );
