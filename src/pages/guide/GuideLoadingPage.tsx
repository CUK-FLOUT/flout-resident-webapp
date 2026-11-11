import { useEffect, useState } from 'react';
import { generatePath, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { getAddressCoordinates, useGuide } from '@/api/risk';
import { getRiskAssessment, parseAssessmentId } from '@/api/riskAnalysis';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { useAddressDraft } from '@/stores/addressDraft';

export function GuideLoadingView({ onBack }: { onBack: () => void }) {
  return (
    <Screen header={{ title: '맞춤 예방 가이드', onBack }} tab="home">
      <div role="status" className="flex flex-col items-center pt-14 text-center">
        <div
          className="border-border border-t-primary size-14 animate-spin rounded-full border-4"
          aria-hidden
        />
        <h1 className="text-title text-ink mt-5">
          우리 집 상황에 맞는
          <br />
          예방 가이드를 만들고 있어요
        </h1>
        <p className="text-body text-muted mt-5">
          주소와 취약도 결과를 참고해 정리 중이에요.
          <br />
          보통 몇 초 걸려요.
        </p>
      </div>
      <div className="mt-8" aria-hidden>
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="border-border flex flex-col gap-2 border-b px-4 py-8 last:border-0"
          >
            <div className="bg-soft h-2.5 w-2/5 animate-pulse rounded-full" />
            <div className="bg-soft h-2.5 w-5/6 animate-pulse rounded-full" />
            <div className="bg-soft h-2.5 w-2/3 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </Screen>
  );
}

export default function GuideLoadingPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const guideId = parseAssessmentId(new URLSearchParams(search).get('guideId') ?? undefined);
  const assessmentNumber = parseAssessmentId(assessmentId);
  const canonicalId = assessmentNumber === null ? assessmentId : String(assessmentNumber);
  const result = useAddressDraft((s) => s.result);
  const valid = Boolean(canonicalId && result && String(result.id) === canonicalId);
  const guide = useGuide(valid ? canonicalId : undefined);
  const [restoreError, setRestoreError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (valid || !guideId || !assessmentNumber) return;
    const controller = new AbortController();
    setRestoreError('');
    void (async () => {
      const assessment = await getRiskAssessment(assessmentNumber, controller.signal);
      if (
        assessment.status !== 'COMPLETED' ||
        assessment.guideId !== guideId ||
        !assessment.floor ||
        assessment.floor === 'SECOND_OR_ABOVE'
      )
        throw new Error('이 분석에 연결된 예방 가이드를 확인할 수 없어요.');
      const coordinates = await getAddressCoordinates(assessment.address);
      if (controller.signal.aborted) return;
      useAddressDraft.getState().setResult({
        ...assessment,
        id: assessmentNumber,
        source: 'api',
        input: {
          address: {
            roadAddress: assessment.address,
            jibunAddress: '',
            buildingName: '',
            zipCode: '',
          },
          coordinates,
          detail: assessment.detailAddress,
          floor: assessment.floor,
        },
      });
    })().catch((error: unknown) => {
      if (!controller.signal.aborted)
        setRestoreError(error instanceof Error ? error.message : '가이드를 불러오지 못했어요.');
    });
    return () => controller.abort();
  }, [assessmentNumber, guideId, valid, attempt]);

  const mismatchedGuide = Boolean(guideId && guide.data && guide.data.id !== String(guideId));

  useEffect(() => {
    if (valid && guide.data && canonicalId && !mismatchedGuide)
      navigate(
        { pathname: generatePath(PATHS.guide, { assessmentId: canonicalId }), search },
        { replace: true },
      );
  }, [valid, guide.data, canonicalId, mismatchedGuide, navigate, search]);

  if (!canonicalId || (!valid && !(guideId && assessmentNumber)))
    return <Navigate to={PATHS.addressSearch} replace />;
  if (guide.isError || restoreError || mismatchedGuide)
    return (
      <Screen
        header={{
          title: '맞춤 예방 가이드',
          onBack: () => navigate(generatePath(PATHS.riskResult, { assessmentId: canonicalId })),
        }}
        tab="home"
        bottom={
          <Button
            onClick={() => {
              if (restoreError) setAttempt((value) => value + 1);
              else void guide.refetch();
            }}
          >
            다시 시도
          </Button>
        }
      >
        <p role="alert" className="text-body text-muted pt-10 text-center">
          {restoreError ||
            (guide.error instanceof Error ? guide.error.message : '가이드를 불러오지 못했어요.')}
        </p>
      </Screen>
    );
  return (
    <GuideLoadingView
      onBack={() => navigate(generatePath(PATHS.riskResult, { assessmentId: canonicalId }))}
    />
  );
}
