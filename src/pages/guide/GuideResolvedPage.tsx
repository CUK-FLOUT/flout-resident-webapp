import { generatePath, Navigate, useNavigate } from 'react-router';
import completionBackground from '@/assets/guide/completion-background.svg';
import completionCheck from '@/assets/guide/completion-check.svg';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getPrimaryAddress } from '@/lib/address';
import { GuideLoadingView } from './GuideLoadingPage';
import { GuideLoadState } from './GuideLoadState';
import { useGuideRoute } from './useGuideRoute';

export function GuideResolvedView({
  address,
  risk,
  count,
  total,
  onGuide,
  onHome,
}: {
  address: string;
  risk: string;
  count: number;
  total: number;
  onGuide: () => void;
  onHome: () => void;
}) {
  const rows = [
    ['주소', address || '주소 정보 없음'],
    ['지역 취약도', risk || '정보 없음'],
    ['예방 가이드', `${count} / ${total} 완료`],
    ['결과', '자가 확인 완료'],
  ];
  return (
    <Screen
      header={{ title: '확인 완료', onBack: false }}
      tab="home"
      bottom={
        <div className="mb-7 flex flex-col gap-[18px]">
          <Button variant="secondary" onClick={onGuide}>
            가이드 다시 보기
          </Button>
          <Button onClick={onHome}>홈으로</Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <div className="relative grid size-16 place-items-center">
          <img src={completionBackground} alt="" width={64} height={64} />
          <img src={completionCheck} alt="" width={28} height={28} className="absolute" />
        </div>
        <h1 className="text-title text-ink">예방 체크를 완료했어요</h1>
        <p className="text-body text-muted">필요하면 언제든 현장점검을 신청할 수 있어요.</p>
      </div>
      <section className="bg-soft mt-6 rounded-md p-4">
        <h2 className="text-heading">이번 확인 요약</h2>
        <dl className="mt-4 flex flex-col gap-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start gap-3">
              <dt className="text-caption text-muted w-[100px] shrink-0">{label}</dt>
              <dd className="text-body text-ink min-w-0 flex-1 text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Screen>
  );
}

const riskLabel = { HIGH: '높음', CAUTION: '보통', LOW: '낮음' };

export default function GuideResolvedPage() {
  const navigate = useNavigate();
  const guide = useGuideRoute({ includeAddress: true });
  const { assessmentId, data, result } = guide;
  if (!assessmentId || !guide.valid) return <Navigate to={PATHS.addressSearch} replace />;

  const guidePath = { pathname: generatePath(PATHS.guide, { assessmentId }), search: guide.search };
  const onGuide = () => navigate(guidePath);
  if (guide.isLoading) return <GuideLoadingView onBack={onGuide} />;
  if (!data) return <GuideLoadState error={guide.error} retry={guide.retry} onBack={onGuide} />;
  if (data.resolution !== 'CONFIRMED') return <Navigate to={guidePath} replace />;

  const grade = data.grade ?? result?.level;
  return (
    <GuideResolvedView
      address={result ? getPrimaryAddress(result.input.address) : (guide.assessment?.address ?? '')}
      risk={grade ? riskLabel[grade] : ''}
      count={data.completedCount ?? data.items.filter((item) => item.done).length}
      total={data.totalCount ?? data.items.length}
      onGuide={onGuide}
      onHome={() => navigate(PATHS.home)}
    />
  );
}
