import { Link, useNavigate } from 'react-router';
import { useCachedResidentProgress } from '@/api/residentProgress';
import backIcon from '@/assets/home/progress/back.svg';
import { Screen, StateMessage } from '@/components/layout';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import { ProgressCard, ProgressCardView } from './ProgressCard';
import { progressStages } from './progressStages';
import './home.css';

export default function HomeProgressPage() {
  const navigate = useNavigate();
  const { state, signedIn } = useCachedResidentProgress();
  const preview = env.useMock;
  const page = state?.data;
  const count = preview ? progressStages.size : page?.items.length;
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(PATHS.home, { replace: true });
  };

  const unavailable = !signedIn
    ? '로그인하면 진행 내역을 확인할 수 있어요.'
    : state?.fetchStatus === 'fetching'
      ? '진행 내역을 불러오고 있어요…'
      : '홈에서 불러온 진행 내역이 없어요.';

  return (
    <Screen
      header={{
        title: '전체보기',
        onBack: goBack,
        backIcon: <img src={backIcon} alt="" />,
        className: 'pl-2.5 [&_h1]:text-[17px]',
      }}
      tab="home"
      refreshUnread={false}
      bleed
      className="resident-home pt-[15px]"
    >
      <section className="px-[18px]" aria-labelledby="all-progress-title">
        <div className="flex min-h-[27px] items-center justify-between gap-3">
          <h2 id="all-progress-title" className="text-ink text-[19px] leading-[27px] font-bold">
            전체 진행 내역
          </h2>
          {count !== undefined && (
            <span className="grid h-[26px] min-w-14 place-items-center rounded-lg bg-(--home-count) px-2 text-[12px] font-bold text-(--home-action)">
              {count}건
            </span>
          )}
        </div>
        <p className="text-muted mt-[3px] text-[12px] leading-5">
          {preview && '예시 데이터 · '}신청별 진행 상태를 확인할 수 있어요.
        </p>
        {!preview && page?.nextCursor && (
          <p className="text-muted text-caption">홈에서 불러온 내역 {count}건을 표시하고 있어요.</p>
        )}
      </section>
      {preview ? (
        <ul className="mt-[22px] flex flex-col gap-4 pr-2.5 pl-[15px]">
          {[...progressStages].map(([stage, props]) => (
            <ProgressCardView key={stage} {...props} address="부천시 원미구 심곡로 12" list />
          ))}
        </ul>
      ) : page?.items.length ? (
        <ul className="mt-[22px] flex flex-col gap-4 pr-2.5 pl-[15px]">
          {page.items.map((item) => (
            <ProgressCard
              key={item.assessmentId}
              item={item}
              list
              stage={progressStages.get(item.currentStage)}
            />
          ))}
        </ul>
      ) : (
        <div className="px-gutter text-center">
          <StateMessage>{page ? '아직 진행 내역이 없어요.' : unavailable}</StateMessage>
          <Link to={PATHS.home} className="text-primary text-label mt-3 inline-block underline">
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </Screen>
  );
}
