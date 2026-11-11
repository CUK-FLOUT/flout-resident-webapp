import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router';
import { getPreventionGuide } from '@/api/preventionGuide';
import { queryKeys } from '@/api/queryClient';
import { useGuide } from '@/api/risk';
import { parseAssessmentId, useRiskAssessment } from '@/api/riskAnalysis';
import { env } from '@/lib/env';
import { ApiError } from '@/lib/http';
import { tokenStorage } from '@/lib/storage';
import { useAddressDraft } from '@/stores/addressDraft';

export function useGuideRoute({ allowGeneration = false, includeAddress = false } = {}) {
  const { assessmentId } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestedGuideId = parseAssessmentId(params.get('guideId') ?? undefined);
  const assessmentNumber = parseAssessmentId(assessmentId);
  const canonicalId = assessmentNumber === null ? assessmentId : String(assessmentNumber);
  const current = useAddressDraft((s) => s.result);
  const result = current && String(current.id) === canonicalId ? current : null;
  const invalidGuideId = !env.useMock && params.has('guideId') && requestedGuideId === null;
  const assessment = useRiskAssessment(
    !invalidGuideId && (!requestedGuideId || (includeAddress && !result)) ? assessmentNumber : null,
  );
  const existingId = requestedGuideId ?? assessment.data?.guideId;
  const shouldGenerate =
    allowGeneration &&
    !invalidGuideId &&
    !existingId &&
    assessment.data?.status === 'COMPLETED' &&
     (result ||
       (!env.useMock &&
         assessment.data.level === 'LOW' &&
         (assessment.data.floor === 'BASEMENT' || assessment.data.floor === 'FIRST')));
  const generated = useGuide((env.useMock ? result : shouldGenerate) ? canonicalId : undefined);
  const guideId = existingId ? String(existingId) : generated.data?.id;
  const sessionId = tokenStorage.readSession()?.id;
  const detailKey = ['prevention-guide', sessionId, canonicalId, guideId];
  const detail = useQuery({
    queryKey: detailKey,
    queryFn: ({ signal }) => getPreventionGuide(canonicalId!, guideId!, signal),
    enabled: !env.useMock && !invalidGuideId && assessmentNumber !== null && Boolean(guideId),
    refetchOnReconnect: false,
    retry: false,
  });
  const data = env.useMock ? generated.data : detail.data;
  const failure = detail.error ?? generated.error ?? (!guideId ? assessment.error : null);
  const error = invalidGuideId
    ? '예방 가이드 번호를 확인할 수 없어요.'
    : failure instanceof ApiError && failure.status === 404
      ? '예방 가이드를 찾을 수 없어요.'
      : failure?.message;
  if (data && !env.useMock) params.set('guideId', data.id);

  return {
    assessmentId: canonicalId,
    assessment: assessment.data,
    result,
    valid: env.useMock ? Boolean(result) : assessmentNumber !== null,
    data,
    isLoading:
      detail.isLoading ||
      generated.isLoading ||
      ((!guideId || includeAddress) && assessment.isLoading),
    error,
    retry:
      invalidGuideId || !failure
        ? undefined
        : () =>
            void (detail.isError
              ? detail.refetch()
              : generated.isError
                ? generated.refetch()
                : assessment.refetch()),
    queryKey: env.useMock ? [...queryKeys.guide(canonicalId ?? ''), sessionId] : detailKey,
    sessionId,
    search: params.toString(),
  };
}
