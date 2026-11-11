import { Link, useNavigate } from 'react-router';
import { useResidentProgress } from '@/api/residentProgress';
import backIcon from '@/assets/home/progress/back.svg';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { ProgressCard } from './ProgressCard';
import { progressStages } from './progressStages';
import './home.css';

export default function HomeProgressPage() {
  const navigate = useNavigate();
  const { items, count, signedIn, isPending, isFetching, isError, retry } = useResidentProgress();
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(PATHS.home, { replace: true });
  };

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
          신청별 진행 상태를 확인할 수 있어요.
        </p>
      </section>
      {signedIn && items.length > 0 && (
        <ul className="mt-[22px] flex flex-col gap-4 pr-2.5 pl-[15px]">
          {items.map((item) => (
            <ProgressCard
              key={item.assessmentId}
              item={item}
              list
              stage={progressStages.get(item.currentStage)}
            />
          ))}
        </ul>
      )}
      {!signedIn ? (
        <div className="px-gutter text-center">
          <StateMessage>로그인하면 진행 내역을 확인할 수 있어요.</StateMessage>
          <Link to={PATHS.home} className="text-primary text-label mt-3 inline-block underline">
            홈으로 돌아가기
          </Link>
        </div>
      ) : isError ? (
        <div className="px-gutter text-center" role="alert">
          <StateMessage>전체 진행 현황을 불러오지 못했어요.</StateMessage>
          <Button
            variant="text"
            size="md"
            fullWidth={false}
            loading={isFetching}
            onClick={() => void retry()}
          >
            다시 시도
          </Button>
        </div>
      ) : isPending || count === undefined ? (
        <div role="status">
          <StateMessage>진행 내역을 불러오고 있어요…</StateMessage>
        </div>
      ) : (
        count === 0 && <StateMessage>아직 진행 내역이 없어요.</StateMessage>
      )}
    </Screen>
  );
}
