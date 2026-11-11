import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ApiError, http } from '@/lib/http';
import type { PreventionGuide } from '@/types/domain';
import { mockAddresses, mockAddressSearchExtra, mockGuide } from '@/api/mocks';
import { queryKeys, withMock } from '@/api/queryClient';
import { env } from '@/lib/env';
import { mockDelay } from '@/api/mocks';
import { parseAssessmentId } from '@/api/riskAnalysis';
import { tokenStorage } from '@/lib/storage';

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

export async function getGuide(assessmentId: string): Promise<PreventionGuide> {
  if (env.useMock) {
    await mockDelay();
    return { ...mockGuide, assessmentId, items: mockGuide.items.map((item) => ({ ...item })) };
  }
  const id = parseAssessmentId(assessmentId);
  if (id === null) throw new ApiError(400, '분석 결과 번호를 확인할 수 없어요.');
  const response = await http.post<{
    isSuccess: boolean;
    status: number;
    message: string;
    code: string;
    result: {
      guideId: number;
      assessmentId: number;
      items: {
        itemId: number;
        order: number;
        title: string;
        description: string;
        completed: boolean;
      }[];
    };
  }>(`/resident/risk-assessments/${id}/guide`);
  if (!response?.isSuccess)
    throw new ApiError(
      response?.status ?? 502,
      response?.message || '가이드를 불러오지 못했어요.',
      response?.code,
    );
  const result = response.result;
  if (
    result?.assessmentId !== id ||
    !Number.isSafeInteger(result.guideId) ||
    !Array.isArray(result.items)
  )
    throw new ApiError(502, '저장된 예방 가이드를 확인할 수 없어요.');
  return {
    id: String(result.guideId),
    assessmentId: String(result.assessmentId),
    items: [...result.items]
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        if (
          typeof item.itemId !== 'number' ||
          !Number.isSafeInteger(item.itemId) ||
          item.itemId <= 0
        ) {
          throw new Error('예방 가이드 항목 ID가 올바르지 않습니다.');
        }

        return {
          id: String(item.itemId),
          title: item.title,
          description: item.description,
          done: item.completed,
        };
      }),
  };
}

export function useGuide(assessmentId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.guide(assessmentId ?? ''), tokenStorage.readSession()?.id],
    queryFn: () => getGuide(assessmentId!),
    enabled: Boolean(assessmentId),
    retry: false,
    staleTime: Infinity,
  });
}
