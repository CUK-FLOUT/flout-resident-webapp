import { Link, useNavigate } from 'react-router';
import { homeProgressLimit, useResidentProgress } from '@/api/residentProgress';
import chevron from '@/assets/home/chevron.svg';
import connector from '@/assets/home/connector.svg';
import divider from '@/assets/home/divider.svg';
import emptyIcon from '@/assets/home/empty.svg';
import heroLogo from '@/assets/home/hero-logo.png';
import heroWave from '@/assets/home/hero-wave.svg';
import search from '@/assets/home/search.svg';
import stepConstruction from '@/assets/home/step-construction.svg';
import stepInspection from '@/assets/home/step-inspection.svg';
import stepSearch from '@/assets/home/step-search.svg';
import stepSupport from '@/assets/home/step-support.svg';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { useAddressDraft } from '@/stores/addressDraft';
import { HomeAccountMenu } from './HomeAccountMenu';
import { ProgressCard } from './ProgressCard';
import './home.css';

const cardSurface = 'rounded-[10px] border border-(--home-border) bg-surface';

function EmptyProgress() {
  return (
    <div className="border-border flex min-h-[140px] flex-col items-center justify-center gap-1.5 rounded-[10px] border p-3 text-center">
      <span className="bg-soft grid size-10 place-items-center rounded-full">
        <img src={emptyIcon} width={24} height={24} alt="" />
      </span>
      <p className="text-body font-semibold">진행 중인 신청이 없어요</p>
      <p className="text-muted text-[12px] leading-[18px]">지역 취약도 확인부터 시작해보세요.</p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch, signedIn } = useResidentProgress();
  const items = data?.items.filter((item) => !item.closed).slice(0, homeProgressLimit) ?? [];
  const searchAddress = () => {
    useAddressDraft.getState().startNewSearch();
    navigate(PATHS.addressSearch);
  };
  const steps = [
    {
      label: '취약도 분석',
      description: '침수 위험 확인',
      icon: stepSearch,
      onClick: searchAddress,
    },
    {
      label: '현장점검',
      description: '전문가 방문 점검',
      icon: stepInspection,
      onClick: () => navigate(PATHS.inspectionApply),
    },
    {
      label: '지원 신청',
      description: '지원사업 신청',
      icon: stepSupport,
      onClick: () => navigate(PATHS.applicationsAll),
    },
    {
      label: '시공',
      description: '예방시설 설치',
      icon: stepConstruction,
      onClick: () => navigate(PATHS.applicationsAll),
    },
  ];

  return (
    <Screen
      header={{
        title: '홈',
        onBack: false,
        right: <HomeAccountMenu />,
        className: '[&_h1]:text-[18px]',
      }}
      tab="home"
      bleed
      className="resident-home px-[15px] pt-3 pb-5!"
    >
      <section className="relative min-h-[164px] overflow-hidden rounded-xl bg-(--home-banner) px-3.5 py-2.5">
        <img
          src={heroWave}
          width={360}
          height={62}
          className="pointer-events-none absolute right-0 bottom-0 max-w-none"
          alt=""
        />
        <img
          src={heroLogo}
          width={117}
          height={93}
          className="pointer-events-none absolute top-[34px] right-[clamp(10px,6vw,25px)] h-auto w-[clamp(70px,calc(60vw-117px),117px)]"
          alt=""
        />
        <div className="relative">
          <p className="text-[12px] leading-[18px] font-bold text-(--home-action)">FLOUT</p>
          <h2 className="mt-2.5 text-[clamp(15px,4.87vw,19px)] leading-[27px] font-bold tracking-[-0.035em]">
            우리 집 침수 걱정
            <br />
            FLOUT와 함께 해결해요!
          </h2>
          <p className="text-muted mt-1.5 text-[12px] leading-[18px]">
            침수 위험 확인부터 현장점검,
            <br />
            지원 신청과 시공까지 안내해 드려요.
          </p>
        </div>
      </section>
      <button
        type="button"
        onClick={searchAddress}
        className={
          cardSurface + ' mt-4 flex min-h-[68px] items-center gap-2.5 px-[11px] py-2 text-left'
        }
      >
        <span className="grid h-[50px] w-12 shrink-0 place-items-center rounded-[9px] bg-(--home-tint)">
          <img src={search} width={28} height={28} alt="" />
        </span>
        <span className="relative h-12 w-px shrink-0" aria-hidden>
          <img
            src={divider}
            width={48}
            height={1}
            className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90"
            alt=""
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-section block">침수 취약도 확인</span>
          <span className="text-muted block text-[11px] leading-[18px] tracking-[-0.035em] min-[420px]:text-[12px]">
            우리 집 주소로 침수 위험도를 확인해 보세요.
          </span>
        </span>
        <img src={chevron} width={17} height={22} className="shrink-0" alt="" />
      </button>
      <section className="mt-4" aria-labelledby="resident-progress">
        <div className="mb-[7px] flex min-h-7 items-center justify-between gap-3">
          <h2 id="resident-progress" className="text-[18px] leading-7 font-bold">
            나의 진행 현황
          </h2>
          <Link to={PATHS.homeProgress} className="text-[12px] font-medium text-(--home-action)">
            전체 보기 <span aria-hidden>›</span>
          </Link>
        </div>
        {!signedIn ? (
          <div
            className={
              cardSurface +
              ' flex min-h-[140px] flex-col items-center justify-center gap-2 p-4 text-center'
            }
          >
            <p className="text-muted">로그인하면 나의 진행 현황을 확인할 수 있어요.</p>
            <Link to={PATHS.login} className="text-primary text-label underline">
              로그인
            </Link>
          </div>
        ) : isLoading ? (
          <p
            role="status"
            className={
              cardSurface + ' text-muted grid min-h-[140px] place-items-center p-4 text-center'
            }
          >
            진행 현황을 불러오고 있어요…
          </p>
        ) : isError ? (
          <div
            role="alert"
            className={
              cardSurface +
              ' flex min-h-[140px] flex-col items-center justify-center p-4 text-center'
            }
          >
            <p className="text-muted">진행 현황을 불러오지 못했어요.</p>
            <Button
              variant="text"
              size="md"
              fullWidth={false}
              loading={isFetching}
              onClick={() => void refetch()}
            >
              다시 시도
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyProgress />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <ProgressCard key={item.assessmentId} item={item} />
            ))}
          </ul>
        )}
      </section>
      <section
        className="mt-6 rounded-xl bg-(--home-panel) pt-3 pb-2"
        aria-labelledby="service-steps"
      >
        <h2 id="service-steps" className="text-section px-3">
          FLOUT 이용 순서
        </h2>
        <ol className="mt-3 grid grid-cols-4">
          {steps.map(({ label, description, icon, onClick }, index) => (
            <li key={label} className="relative min-w-0 text-center">
              {index > 0 && (
                <img
                  src={connector}
                  width={48}
                  height={2}
                  className="pointer-events-none absolute top-[19px] left-0 max-w-none -translate-x-1/2"
                  alt=""
                />
              )}
              <button
                type="button"
                onClick={onClick}
                className="relative flex w-full flex-col items-center rounded-md px-0.5"
              >
                <span className="bg-surface grid size-[42px] place-items-center rounded-full">
                  <img src={icon} width={24} height={24} alt="" />
                </span>
                <span className="mt-2.5 text-[11px] leading-[18px] font-bold">{label}</span>
                <span className="text-muted mt-2 text-[10px] leading-4">{description}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="text-muted mx-2.5 mt-6 rounded-xl bg-(--home-note) px-1.5 py-[6px] text-center text-[10px] leading-[18px]">
          <span aria-hidden>ⓘ </span>분석 결과와 지원 조건에 따라 진행 단계가 달라질 수 있어요.
        </p>
      </section>
    </Screen>
  );
}
