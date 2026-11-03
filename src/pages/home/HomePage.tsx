import { ChevronRight, ClipboardCheck, FileText, HardHat, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { PATHS } from '@/constants/paths';
import { recentAddressStorage } from '@/lib/storage';
import { useAddressDraft } from '@/stores/addressDraft';

const steps = [
  ['침수 취약도 확인', '우리 집 위험도를 먼저 확인해요.'],
  ['현장점검 신청', '전문가가 직접 점검해요.'],
  ['지원 신청', '예방시설 지원을 신청해요.'],
  ['시공 신청', '지원사업으로 시공을 신청해요.'],
];

export default function HomePage() {
  const navigate = useNavigate();
  const recent = recentAddressStorage.list()[0];
  return (
    <Screen header={{ title: '홈', onBack: false }} tab="home">
      <section className="bg-soft mt-4 rounded-xl px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(60px,88px)] items-center gap-2">
          <div className="min-w-0">
            <p className="text-primary text-[12px] leading-5 font-bold">FLOUT</p>
            <h2 className="text-ink mt-1.5 text-[clamp(20px,6.67vw,26px)] leading-9 font-bold tracking-[-0.04em]">
              내 집의 침수 취약도
              <br />
              지금 확인해보세요!
            </h2>
            <p className="text-muted mt-1.5 text-[12px] leading-[18px]">
              주소를 입력하고 침수 위험도를
              <br />
              분석할 수 있어요.
            </p>
          </div>
          <img src="/logo.svg" alt="" className="w-full object-contain" />
        </div>
        {recent && (
          <p className="text-caption text-primary mt-3 flex items-center gap-1">
            <MapPin size={15} aria-hidden />
            {recent.address}
          </p>
        )}
      </section>
      <button
        type="button"
        onClick={() => {
          useAddressDraft.getState().startNewSearch();
          navigate(PATHS.addressSearch);
        }}
        className="border-border mt-[18px] flex min-h-[76px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left"
      >
        <span className="text-primary flex size-7 shrink-0 items-center justify-center">
          <Search size={22} aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block text-[18px] leading-6 font-bold">침수 취약도 확인</span>
          <span className="text-muted mt-1 block text-[12px] leading-5">
            주소 검색으로 우리 집 위험도를 분석해요.
          </span>
        </span>
        <ChevronRight size={20} className="text-primary shrink-0" aria-hidden />
      </button>
      <section aria-label="주요 서비스" className="mt-[18px] grid grid-cols-3 gap-2.5">
        <Service
          icon={<ClipboardCheck size={24} />}
          label="현장점검하기"
          onClick={() => navigate(PATHS.inspectionApply)}
        />
        <Service
          icon={<FileText size={24} />}
          label="지원하기"
          onClick={() => navigate(PATHS.applicationsAll)}
        />
        <Service
          icon={<HardHat size={24} />}
          label="시공하기"
          onClick={() => navigate(PATHS.applicationsAll)}
        />
      </section>
      <section className="mt-[18px]">
        <h2 className="text-heading">이렇게 이용해보세요!</h2>
        <ol className="mt-3.5 flex flex-col gap-2">
          {steps.map(([title, desc], index) => (
            <li key={title} className="flex items-center gap-4">
              <span className="bg-soft text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {index + 1}
              </span>
              <span>
                <span className="text-label block font-bold">{title}</span>
                <span className="text-muted block text-[12px] leading-[18px]">{desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </Screen>
  );
}

function Service({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border bg-surface flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-lg border px-1 py-3 text-center"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex items-center justify-center text-[13px] leading-5 font-bold">
        {label}
      </span>
    </button>
  );
}
