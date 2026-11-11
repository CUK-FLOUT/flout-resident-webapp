import { useQuery } from '@tanstack/react-query';
import { queryKeys, withMock } from '@/api/queryClient';
import { ApiError, http } from '@/lib/http';
import { tokenStorage } from '@/lib/storage';
import { resultMock } from './inspectionResultMock';

export const inspectionVulnerabilityLabel = {
  ENTRANCE: '출입구',
  WINDOW_OPENING: '창문·개구부',
  DRAIN: '배수구',
  OTHER_STRUCTURE: '기타 구조',
} as const;

interface InspectionVulnerability {
  type: keyof typeof inspectionVulnerabilityLabel;
  title: string;
  expertOpinion: string;
  fieldFindings: string | null;
}

export interface PublishedInspectionResult {
  applicationId: number;
  summary: string;
  publishedAt: string;
  vulnerabilities: readonly InspectionVulnerability[];
  photos: readonly { photoId: number; url: string }[];
}

interface InspectionRecommendations {
  applicationId: number;
  recommendedActions: { description: string }[];
}

interface ResultEnvelope<T> {
  isSuccess: boolean;
  status: number;
  message: string;
  code: string;
  result: T | null;
}

async function readResult<T extends { applicationId: number }>(
  applicationId: number,
  endpoint: 'result' | 'recommendations',
  signal?: AbortSignal,
) {
  const response = await http.get<ResultEnvelope<T>>(
    `/resident/applications/${applicationId}/${endpoint}`,
    { signal },
  );
  if (!response?.isSuccess)
    throw new ApiError(
      response?.status ?? 502,
      response?.message || '현장점검 결과를 불러오지 못했어요.',
      response?.code,
    );
  if (response.result?.applicationId !== applicationId)
    throw new ApiError(502, '신청 건의 점검 결과를 확인할 수 없어요.');
  return response.result;
}

export function getInspectionResult(applicationId: number, signal?: AbortSignal) {
  return withMock<PublishedInspectionResult>(
    () => ({
      applicationId,
      summary: resultMock.summary,
      publishedAt: resultMock.publishedAt,
      vulnerabilities: resultMock.vulnerabilities,
      photos: resultMock.photos,
    }),
    async () => {
      const result = await readResult<PublishedInspectionResult>(applicationId, 'result', signal);
      if (
        typeof result.summary !== 'string' ||
        typeof result.publishedAt !== 'string' ||
        !Number.isFinite(Date.parse(result.publishedAt)) ||
        !Array.isArray(result.vulnerabilities) ||
        result.vulnerabilities.some(
          (point) =>
            !point ||
            !Object.hasOwn(inspectionVulnerabilityLabel, point.type) ||
            typeof point.title !== 'string' ||
            typeof point.expertOpinion !== 'string' ||
            (point.fieldFindings != null && typeof point.fieldFindings !== 'string'),
        ) ||
        !Array.isArray(result.photos) ||
        result.photos.some(
          (photo) =>
            !photo ||
            !Number.isSafeInteger(photo.photoId) ||
            typeof photo.url !== 'string' ||
            !photo.url.trim(),
        )
      )
        throw new ApiError(502, '점검 결과 응답을 확인할 수 없어요.');
      return result;
    },
  );
}

export function getInspectionRecommendations(applicationId: number, signal?: AbortSignal) {
  return withMock<InspectionRecommendations>(
    () => ({
      applicationId,
      recommendedActions: resultMock.recommendations.map((description) => ({ description })),
    }),
    async () => {
      const result = await readResult<InspectionRecommendations>(
        applicationId,
        'recommendations',
        signal,
      );
      if (
        !Array.isArray(result.recommendedActions) ||
        result.recommendedActions.some((action) => typeof action?.description !== 'string')
      )
        throw new ApiError(502, '권장 예방조치 응답을 확인할 수 없어요.');
      return result;
    },
  );
}

export function useInspectionResult(applicationId: number) {
  return useQuery({
    queryKey: [...queryKeys.result(String(applicationId)), tokenStorage.readSession()?.id],
    queryFn: ({ signal }) => getInspectionResult(applicationId, signal),
  });
}

export function useInspectionRecommendations(applicationId: number) {
  return useQuery({
    queryKey: [
      ...queryKeys.inspectionRecommendations(String(applicationId)),
      tokenStorage.readSession()?.id,
    ],
    queryFn: ({ signal }) => getInspectionRecommendations(applicationId, signal),
  });
}
