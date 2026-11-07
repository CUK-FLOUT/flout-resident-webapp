import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ApiError, http } from '@/lib/http';
import type { PreventionGuide, UnresolvedReason } from '@/types/domain';
import { mockAddresses, mockAddressSearchExtra, mockGuide } from '@/api/mocks';
import { queryKeys, withMock } from '@/api/queryClient';
import { env } from '@/lib/env';
import { mockDelay } from '@/api/mocks';

/* ── RISK-01 주소 검색 (Swagger AddressSearchResult) ─────────────── */
export interface AddressSearchItem {
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  zipCode: string;
}
export interface AddressSearchResponse {
  addresses: AddressSearchItem[];
  currentPage: number;
  countPerPage: number;
  hasMore: boolean;
  nextPage: number | null;
}
interface AddressEnvelope<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
}

function unwrapAddress<T>(response: AddressEnvelope<T> | null): T {
  if (!response?.isSuccess)
    throw new ApiError(
      response?.status ?? 502,
      response?.message || '주소 서비스 응답을 확인할 수 없어요.',
      response?.code,
    );
  if (response.result == null) throw new ApiError(502, '주소 서비스 응답을 확인할 수 없어요.');
  return response.result;
}

export async function searchAddress(
  keyword: string,
  currentPage = 1,
  signal?: AbortSignal,
): Promise<AddressSearchResponse> {
  return withMock(
    () => {
      const words = keyword.trim().split(/\s+/);
      const addresses = [...mockAddresses, ...mockAddressSearchExtra]
        .filter((a) => {
          const text = `${a.roadAddress} ${a.jibunAddress} ${a.buildingName ?? ''}`;
          return words.every((word) => text.includes(word));
        })
        .map(({ roadAddress, jibunAddress, buildingName, zipCode }) => ({
          roadAddress,
          jibunAddress,
          buildingName: buildingName ?? '',
          zipCode,
        }));
      return {
        addresses: addresses.slice((currentPage - 1) * 10, currentPage * 10),
        currentPage,
        countPerPage: 10,
        hasMore: currentPage * 10 < addresses.length,
        nextPage: currentPage * 10 < addresses.length ? currentPage + 1 : null,
      };
    },
    async () => {
      const response = await http.get<AddressEnvelope<AddressSearchResponse>>(
        '/resident/addresses/search',
        {
          query: { keyword, currentPage },
          signal,
        },
      );
      const result = unwrapAddress(response);
      if (
        !Array.isArray(result.addresses) ||
        result.currentPage !== currentPage ||
        typeof result.hasMore !== 'boolean' ||
        (result.hasMore &&
          (result.nextPage == null ||
            !Number.isInteger(result.nextPage) ||
            result.nextPage <= result.currentPage))
      )
        throw new ApiError(502, '주소 검색 결과를 확인할 수 없어요.');
      return result;
    },
  );
}

export function useAddressSearch(keyword: string, revision = 0, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.address(keyword), revision],
    queryFn: ({ pageParam, signal }) => searchAddress(keyword, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextPage != null && lastPage.nextPage > lastPage.currentPage
        ? lastPage.nextPage
        : undefined,
    enabled: enabled && keyword.trim().length > 0,
    staleTime: 5 * 60_000,
  });
}

export interface AddressCoordinates {
  latitude: number;
  longitude: number;
}

export async function getAddressCoordinates(address: string): Promise<AddressCoordinates> {
  return withMock(
    () => ({ latitude: 37.4874849962478, longitude: 126.79856716311 }),
    async () => {
      const response = await http.get<AddressEnvelope<AddressCoordinates>>(
        '/resident/addresses/coordinates',
        {
          query: { address },
        },
      );
      const result = unwrapAddress(response);
      if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
        throw new ApiError(502, '주소 좌표를 확인할 수 없어요.');
      }
      return result;
    },
  );
}

export function useAddressCoordinates() {
  return useMutation({ mutationFn: getAddressCoordinates });
}

/* ── RISK-07 예방 가이드 (취약도 낮음 플로우) ─────────────────────── */

// TODO(백엔드): 확정된 가이드 생성·조회 API와 응답을 연결합니다.
export async function getGuide(assessmentId: string): Promise<PreventionGuide> {
  if (!env.useMock) throw new Error('맞춤 예방 가이드 서비스는 준비 중이에요.');
  await mockDelay();
  return { ...mockGuide, assessmentId, items: mockGuide.items.map((item) => ({ ...item })) };
}

export function useGuide(assessmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.guide(assessmentId ?? ''),
    queryFn: () => getGuide(assessmentId!),
    enabled: Boolean(assessmentId),
    retry: false,
  });
}

export const reportGuideOutcome = async (input: {
  guideId: string;
  resolved: boolean;
  reasons?: UnresolvedReason[];
}): Promise<void> => {
  void input;
  // TODO(백엔드): 해결 여부 저장 API가 확정되면 연결합니다.
  if (!env.useMock) throw new Error('가이드 결과 저장 서비스는 준비 중이에요.');
};
