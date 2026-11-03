import { AlertTriangle, CloudRain, Droplet, MapPin } from 'lucide-react';
import { generatePath, Navigate, useNavigate, useParams } from 'react-router';
import { AlertCircle, CheckCircle, House } from 'lucide-react';
import { mockRiskContent } from '@/api/mocks';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getPrimaryAddress } from '@/lib/address';
import { cn } from '@/lib/cn';
import { useAddressDraft } from '@/stores/addressDraft';
import type { AddressSearchItem } from '@/api/risk';
import type { MockRiskLevel } from '@/api/riskAnalysis';
import type { ResidenceFloor } from '@/stores/addressDraft';

const icons = [AlertTriangle, Droplet, MapPin];

export default function RiskResultPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { address, coordinates, detail, floor, result } = useAddressDraft();
  if (!address || !coordinates) return <Navigate to={PATHS.addressSearch} replace />;
  if (!floor) return <Navigate to={PATHS.addressDetail} replace />;
  if (!result || result.id !== assessmentId) return <Navigate to={PATHS.addressDetail} replace />;
  return (
    <RiskResultView
      address={address}
      detail={detail}
      floor={floor}
      level={result.level}
      onBack={() => navigate(PATHS.addressDetail)}
      onGuide={() => navigate(generatePath(PATHS.guideLoading, { assessmentId: result.id }))}
    />
  );
}

export function RiskResultView({
  address,
  detail,
  floor,
  level,
  onBack,
  onGuide,
}: {
  address: AddressSearchItem;
  detail: string;
  floor: ResidenceFloor;
  level: MockRiskLevel;
  onBack: () => void;
  onGuide?: () => void;
}) {
  const upper = floor === 'SECOND_OR_ABOVE';
  const data = mockRiskContent[level];
  const RiskIcon = { HIGH: AlertTriangle, CAUTION: AlertCircle, LOW: CheckCircle }[level];
  const factors = upper
    ? [
        '지형 · 저지대와 주변 도로 확인',
        '배수 · 빗물받이 막힘 여부 확인',
        '기상 · 호우특보와 재난문자 확인',
      ]
    : data.factors;
  return (
    <Screen
      header={{ title: '취약도 결과', onBack }}
      tab="home"
      bottom={
        !upper && (
          <>
            {level === 'LOW' && (
              <Button
                variant="secondary"
                disabled
                className="disabled:border-border disabled:bg-surface disabled:text-ink disabled:border"
              >
                가이드 없이 바로 현장점검 신청하기
              </Button>
            )}
            <Button disabled={level !== 'LOW' || !onGuide} onClick={onGuide}>
              {level === 'LOW' ? '예방 가이드 보기' : '현장점검 신청하기'}
            </Button>
          </>
        )
      }
    >
      <section className="pt-4">
        <h1 className="text-ink mt-2 text-[18px] leading-7 font-bold">
          {getPrimaryAddress(address)}
        </h1>
        <p className="text-body-text mt-1 text-[15px] leading-[22px] font-medium">
          {detail.trim() && `${detail.trim()} · `}
          {floor === 'BASEMENT' ? '반지하 / 지하' : floor === 'FIRST' ? '1층' : '2층 이상'}
        </p>
      </section>
      {upper ? (
        <section className="mt-8">
          <h2 className="text-primary flex items-center gap-2 text-[22px] leading-7 font-bold">
            <House size={20} className="text-success shrink-0" aria-hidden />집 안 침수 위험은
            낮아요.
          </h2>
          <p className="text-body text-body-text mt-2">
            2층 이상은 지면에서 유입되는 물의 영향을 상대적으로 덜 받아요. 다만 건물 출입구·지하
            공간과 주변 도로는 침수될 수 있어요.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2">
            <div className="border-border flex min-w-0 flex-col gap-3 border-r pr-4">
              <p className="text-section font-semibold">침수 취약도</p>
              <p className={cn('text-risk flex items-center gap-2', data.color)}>
                <RiskIcon size={20} aria-hidden />
                {data.label}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3 pl-4">
              <p className="text-section font-semibold">현장 점검 필요도</p>
              <p className="text-primary text-[18px] leading-6 font-bold">{data.need}</p>
            </div>
          </section>
          <p className="text-body text-body-text mt-6">
            취약도와 점검 필요도는 AI 참고 결과예요. 실제 취약지점과 필요한 시설은 전문가
            현장점검으로 확인해요.
          </p>
        </>
      )}
      <section className="mt-8">
        <h2 className="text-[18px] leading-6 font-bold">
          {upper ? '주변 지역에서 확인할 정보' : 'AI 분석에서 참고한 위험요인'}
        </h2>
        {upper && (
          <p className="text-body text-muted mt-2">
            거주 층과 별개로 주변 도로와 공용공간의 위험을 확인해 주세요.
          </p>
        )}
        <ul className="mt-3 flex flex-col gap-3">
          {factors.map((factor, i) => {
            const Icon = upper && i === 2 ? CloudRain : icons[i];
            return (
              <li key={factor} className="text-body flex items-center gap-3">
                <Icon size={20} className="text-primary shrink-0" aria-hidden />
                {factor}
              </li>
            );
          })}
        </ul>
      </section>
      {upper ? (
        <section className="mt-8">
          <h2 className="text-[18px] leading-6 font-bold">일반 예방 가이드</h2>
          <ul className="text-body bg-soft mt-3 flex flex-col gap-3 rounded-md p-4">
            {[
              '지하 주차장·침수 도로에 접근하지 않기',
              '대피 경로와 비상 연락처 확인하기',
              '호우특보 때 외출을 줄이고 안내 확인하기',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle size={18} className="text-success mt-0.5 shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-8">
          <h2 className={cn('text-section', data.color)}>{data.title}</h2>
          <p className="text-body mt-2">{data.message}</p>
        </section>
      )}
    </Screen>
  );
}
