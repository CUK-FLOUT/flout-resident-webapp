import { generatePath, Navigate, useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { PATHS } from '@/constants/paths';
import { GuideLoadState } from './GuideLoadState';
import { useGuideRoute } from './useGuideRoute';

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
  const navigate = useNavigate();
  const guide = useGuideRoute({ allowGeneration: true });
  const { assessmentId } = guide;

  if (!assessmentId || !guide.valid) return <Navigate to={PATHS.addressSearch} replace />;

  const onBack = () => navigate(generatePath(PATHS.riskResult, { assessmentId }));
  if (guide.isLoading) return <GuideLoadingView onBack={onBack} />;
  if (!guide.data)
    return <GuideLoadState error={guide.error} retry={guide.retry} onBack={onBack} />;

  return (
    <Navigate
      to={{ pathname: generatePath(PATHS.guide, { assessmentId }), search: guide.search }}
      replace
    />
  );
}
