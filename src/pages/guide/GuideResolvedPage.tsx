import { Check } from 'lucide-react';
import { generatePath, Navigate, useNavigate, useParams } from 'react-router';
import { useGuide } from '@/api/risk';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getPrimaryAddress } from '@/lib/address';
import { useAddressDraft } from '@/stores/addressDraft';
import { useGuideProgress } from '@/stores/guideProgress';

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
    ['침수 취약도', risk || '정보 없음'],
    ['예방 가이드', `${count} / ${total} 완료`],
    ['결과', '자체 해결'],
  ];
  return (
    <Screen
      header={{ title: '확인 완료', onBack: false }}
      tab="home"
      bottom={
        <>
          <Button variant="secondary" onClick={onGuide}>
            가이드 다시 보기
          </Button>
          <Button onClick={onHome}>홈으로</Button>
        </>
      }
    >
      <div className="flex flex-col items-center pt-6 text-center">
        <span className="bg-soft text-primary flex size-16 items-center justify-center rounded-full">
          <Check size={28} aria-hidden />
        </span>
        <h1 className="text-title text-ink mt-4">해결되어 다행이에요</h1>
        <p className="text-body text-muted mt-3">필요하면 언제든 현장점검을 신청할 수 있어요.</p>
      </div>
      <section className="bg-soft mt-6 rounded-md p-4">
        <h2 className="text-heading">이번 확인 요약</h2>
        <dl className="mt-4 flex flex-col gap-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-caption text-muted shrink-0">{label}</dt>
              <dd className="text-body text-ink text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="text-caption text-muted mt-6">
        취약도가 낮아도 비가 많이 오는 날에는
        <br />
        기상 정보와 주변 상황을 계속 확인해 주세요.
      </p>
    </Screen>
  );
}

export default function GuideResolvedPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const result = useAddressDraft((s) => s.result);
  const valid = Boolean(assessmentId && result && String(result.id) === assessmentId);
  const guide = useGuide(valid ? assessmentId : undefined);
  const completed = useGuideProgress((s) => s.completed);
  const resolved = useGuideProgress((s) => s.resolved);
  if (!assessmentId || !valid || !result) return <Navigate to={PATHS.addressSearch} replace />;
  if (!resolved[assessmentId])
    return <Navigate to={generatePath(PATHS.guide, { assessmentId })} replace />;
  if (guide.isLoading)
    return <Navigate to={generatePath(PATHS.guideLoading, { assessmentId })} replace />;
  if (!guide.data)
    return (
      <Screen
        header={{ title: '확인 완료' }}
        bottom={<Button onClick={() => void guide.refetch()}>다시 시도</Button>}
      >
        <p role="alert" className="text-body text-muted pt-10 text-center">
          가이드를 불러오지 못했어요.
        </p>
      </Screen>
    );
  const input = result.input;
  return (
    <GuideResolvedView
      address={getPrimaryAddress(input.address)}
      risk={{ HIGH: '높음', CAUTION: '보통', LOW: '낮음' }[result.level]}
      count={
        guide.data.items.filter((item) => completed[assessmentId]?.includes(item.id) ?? item.done)
          .length
      }
      total={guide.data.items.length}
      onGuide={() => navigate(generatePath(PATHS.guide, { assessmentId }))}
      onHome={() => navigate(PATHS.home)}
    />
  );
}
