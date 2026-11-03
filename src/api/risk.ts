import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ApiError, http } from '@/lib/http';
import type { PreventionGuide, UnresolvedReason } from '@/types/domain';
import { mockAddresses, mockAddressSearchExtra, mockGuide } from '@/api/mocks';
import { queryKeys, withMock } from '@/api/queryClient';

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
      if (!response.isSuccess) throw new ApiError(response.status, response.message, response.code);
      return response.result;
    },
  );
}

export function useAddressSearch(keyword: string, revision = 0, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.address(keyword), revision],
    queryFn: ({ pageParam, signal }) => searchAddress(keyword, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, _lastPageParam, allPageParams) =>
      lastPage.hasMore && lastPage.nextPage != null && !allPageParams.includes(lastPage.nextPage)
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
      if (!response.isSuccess) throw new ApiError(response.status, response.message, response.code);
      if (
        !Number.isFinite(response.result?.latitude) ||
        !Number.isFinite(response.result?.longitude)
      ) {
        throw new ApiError(0, '주소 좌표를 확인할 수 없어요.');
      }
      return response.result;
    },
  );
}

export function useAddressCoordinates() {
  return useMutation({ mutationFn: getAddressCoordinates });
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
