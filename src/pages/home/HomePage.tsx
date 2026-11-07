import { ChevronRight, ClipboardCheck, Search } from 'lucide-react';
import { generatePath, Link, useNavigate } from 'react-router';
import { useApplications } from '@/api/applications';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { APPLICATION_STAGE } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { useAddressDraft } from '@/stores/addressDraft';

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useApplications();
  // 내 신청 화면과 동일하게 전체 완료·지원 미승인은 진행 중 목록에서 제외합니다.
  const applications = data?.filter(
    (item) => item.stage !== 'COMPLETED' && item.stage !== 'SUPPORT_REJECTED',
  );
  const empty = applications?.length === 0;
  const searchAddress = () => {
    useAddressDraft.getState().startNewSearch();
    navigate(PATHS.addressSearch);
  };
  const steps: { label: string; Icon?: typeof Search; asset?: string; onClick: () => void }[] = [
    { label: '취약도 분석', Icon: Search, onClick: searchAddress },
    { label: '현장점검', Icon: ClipboardCheck, onClick: () => navigate(PATHS.inspectionApply) },
    { label: '지원', asset: '/home-support.svg', onClick: () => navigate(PATHS.applicationsAll) },
    {
      label: '시공',
      asset: '/home-construction.svg',
      onClick: () => navigate(PATHS.applicationsAll),
    },
  ];
  return (
    <Screen
      header={{ title: '홈', onBack: false, className: '[&_h1]:text-[18px]' }}
      tab="home"
      className="gap-3.5 pt-4"
    >
      <section className="bg-soft flex min-h-24 items-center justify-between gap-2 rounded-xl px-4 py-3">
        <h2 className="text-ink text-[clamp(18px,5.64vw,22px)] leading-9 font-bold tracking-[-0.03em]">
          우리 동네 침수 취약도
          <br />
          지금 확인해보세요!
        </h2>
        <img src="/logo.svg" alt="" className="w-[clamp(64px,22.56vw,88px)] shrink-0" />
      </section>
      <button
        type="button"
        onClick={searchAddress}
        className="border-border flex min-h-[76px] items-center gap-3 rounded-lg border px-4 py-3 text-left"
      >
        <Search size={28} strokeWidth={1.5} className="text-primary shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="text-ink block text-[18px] leading-6 font-bold">지역 취약도 확인</span>
          {empty && (
            <span className="text-muted mt-1 block text-[12px] leading-5">
              주소 주변의 지형·환경을 확인해요.
            </span>
          )}
        </span>
        <ChevronRight size={22} strokeWidth={1.5} className="text-muted shrink-0" aria-hidden />
      </button>
      <section aria-labelledby="ongoing-applications">
        <h2
          id="ongoing-applications"
          className={
            empty ? 'text-ink mb-2 text-[20px] leading-7 font-bold' : 'text-section mb-2 leading-7'
          }
        >
          진행 중인 신청
        </h2>
        {isLoading ? (
          <p
            role="status"
            className="border-border text-muted text-body rounded-[10px] border px-4 py-12 text-center"
          >
            신청 내역을 불러오고 있어요…
          </p>
        ) : isError || !applications ? (
          <div role="alert" className="border-border rounded-[10px] border p-4 text-center">
            <p className="text-body text-muted">신청 내역을 불러오지 못했어요.</p>
            <Button variant="text" size="md" onClick={() => void refetch()}>
              다시 시도
            </Button>
          </div>
        ) : empty ? (
          <div className="border-border flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[10px] border text-center">
            <span className="bg-soft text-primary mb-0.5 flex size-10 items-center justify-center rounded-full">
              <ClipboardCheck size={24} strokeWidth={1.5} aria-hidden />
            </span>
            <p className="text-ink text-body font-semibold">진행 중인 신청이 없어요</p>
            <p className="text-muted text-[12px] leading-[18px]">
              지역 취약도 확인부터 시작해보세요.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-[17px]">
            {applications.map((item) => (
              <li key={item.id}>
                <Link
                  to={generatePath(
                    item.stage === 'INSPECTION_COMPLETED' ? PATHS.result : PATHS.applicationDetail,
                    { applicationId: item.id },
                  )}
                  className="border-border flex min-h-14 items-center gap-2 rounded-[10px] border px-3 py-[5px]"
                >
                  <span className="bg-soft text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
                    <ClipboardCheck size={24} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-body text-ink block font-semibold">신청 {item.id}</span>
                    <span className="text-muted block truncate text-[12px] leading-[18px]">
                      {item.address}
                    </span>
                  </span>
                  <span className="bg-soft text-primary min-w-[82px] shrink-0 rounded-full px-2 py-1 text-center text-[12px] leading-5 font-semibold">
                    {APPLICATION_STAGE[item.stage].label}
                  </span>
                  <ChevronRight size={16} className="text-primary shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="bg-soft rounded-xl px-3.5 py-3" aria-labelledby="service-steps">
        <h2 id="service-steps" className="text-section">
          {empty ? '이용 순서' : 'FLOUT 이용 순서'}
        </h2>
        <ol className="mt-2 flex items-center justify-between">
          {steps.map(({ label, Icon, asset, onClick }, index) => (
            <li key={label} className="flex min-w-0 items-center gap-[clamp(0px,2vw,8px)]">
              {index > 0 && (
                <span className="text-primary text-[18px]" aria-hidden>
                  →
                </span>
              )}
              <button
                type="button"
                onClick={onClick}
                className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-md px-1"
              >
                <span className="text-primary flex size-10 items-center justify-center">
                  {asset ? (
                    <span
                      className="bg-primary block size-6"
                      style={{
                        maskImage: `url(${asset})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                      }}
                      aria-hidden
                    />
                  ) : (
                    Icon && <Icon size={24} strokeWidth={1.5} aria-hidden />
                  )}
                </span>
                <span className="text-ink text-[12px] leading-[18px] font-semibold whitespace-nowrap">
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </Screen>
  );
}
