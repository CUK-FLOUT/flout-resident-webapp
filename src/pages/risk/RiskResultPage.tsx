import { useEffect, useRef, useState } from 'react';
import { generatePath, Link, useLocation, useNavigate, useParams } from 'react-router';
import { getAddressCoordinates } from '@/api/risk';
import { parseAssessmentId, useRiskAssessment } from '@/api/riskAnalysis';
import regionEnvironment from '@/assets/risk/region-environment.svg';
import regionSlope from '@/assets/risk/region-slope.svg';
import regionTerrain from '@/assets/risk/region-terrain.svg';
import upperCheck from '@/assets/risk/upper-check.svg';
import upperDrain from '@/assets/risk/upper-drain.svg';
import upperHouseRoof from '@/assets/risk/upper-house-roof.svg';
import upperWeather from '@/assets/risk/upper-weather.svg';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getPrimaryAddress } from '@/lib/address';
import { cn } from '@/lib/cn';
import { ApiError, RefreshError } from '@/lib/http';
import { useAddressDraft, type ResidenceFloor } from '@/stores/addressDraft';
import type { RiskLevel } from '@/types/domain';
import { RiskLoadingContent } from './RiskLoadingPage';
import './riskResult.css';

const title = '지역 취약도 결과';
const floorLabels: Record<ResidenceFloor, string> = {
  BASEMENT: '반지하 / 지하',
  FIRST: '1층',
  SECOND_OR_ABOVE: '2층 이상',
};
const grades = {
  HIGH: { label: '높음', color: 'text-danger' },
  CAUTION: { label: '보통', color: 'text-warning' },
  LOW: { label: '낮음', color: 'text-success' },
};
const regionalInfo = [
  [regionTerrain, '지형 · 주변 대비 높이'],
  [regionSlope, '경사 · 땅의 기울기'],
  [regionEnvironment, '주변 환경 · 건물·도로 비율'],
] as const;
const surroundingInfo = [
  [regionTerrain, '지형 · 저지대와 주변 도로 확인'],
  [upperDrain, '배수 · 빗물받이 막힘 여부 확인'],
  [upperWeather, '기상 · 호우특보와 재난문자 확인'],
] as const;
const prevention = [
  '지하 주차장·침수 도로에 접근하지 않기',
  '대피 경로와 비상 연락처 확인하기',
  '호우특보 시 외출 줄이고 안내 확인하기',
];
const cardStyle = 'border-border/70 rounded-xl border';

export default function RiskResultPage() {
  const { assessmentId } = useParams();
  return <RiskResultRoute key={assessmentId} assessmentId={assessmentId} />;
}

function RiskResultRoute({ assessmentId }: { assessmentId?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, address, coordinates, detail, floor, setResult } = useAddressDraft();
  const id = parseAssessmentId(assessmentId);
  const current = result && String(result.id) === assessmentId ? result : null;
  const query = useRiskAssessment(current ? null : id);
  const data = current ?? query.data;
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(false);
  const busy = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const storedFloor = location.state?.riskFloor;
  const selectedFloor =
    current?.input.floor ??
    query.data?.floor ??
    (location.state?.assessmentId === assessmentId &&
    (storedFloor === 'BASEMENT' || storedFloor === 'FIRST' || storedFloor === 'SECOND_OR_ABOVE')
      ? storedFloor
      : null);
  const checkAddress = () =>
    navigate(address && coordinates ? PATHS.addressDetail : PATHS.addressSearch);
  const back = () => {
    if (location.state?.fromProgressList === true) navigate(-1);
    else checkAddress();
  };

  if (query.isError || !data) {
    const apiError = query.error instanceof ApiError ? query.error : null;
    const missing = !query.isFetching && !query.isError;
    const retry =
      query.isError &&
      (apiError instanceof RefreshError || ![401, 403, 404].includes(apiError?.status ?? 0));
    return (
      <Screen header={{ title, onBack: back }} tab="home">
        {query.isFetching && !query.isError ? (
          <RiskLoadingContent />
        ) : (
          <div className="flex flex-col gap-4 pt-14 text-center" role="alert">
            <h2 className="text-heading">분석 결과를 불러올 수 없어요</h2>
            <p className="text-body text-muted">
              {missing || apiError?.status === 404
                ? '확인할 수 있는 분석 결과가 없어요. 주소를 다시 확인해 주세요.'
                : apiError?.status === 401 && !(apiError instanceof RefreshError)
                  ? '로그인이 필요해요.'
                  : (query.error?.message ?? '잠시 후 다시 시도해 주세요.')}
            </p>
            {retry && (
              <Button loading={query.isFetching} onClick={() => void query.refetch()}>
                다시 시도
              </Button>
            )}
            <Button variant="secondary" onClick={checkAddress}>
              주소 확인하기
            </Button>
          </div>
        )}
      </Screen>
    );
  }

  if (data.status !== 'COMPLETED')
    return (
      <Screen header={{ title: '취약도 분석', onBack: back }} tab="home">
        {data.status === 'FAILED' ? (
          <div className="flex flex-col gap-4 pt-14 text-center" role="alert">
            <p className="text-body text-muted">분석을 완료하지 못했어요.</p>
            <Button
              onClick={() =>
                navigate(
                  address && coordinates && detail.trim() && floor
                    ? PATHS.riskLoading
                    : PATHS.addressSearch,
                )
              }
            >
              다시 분석하기
            </Button>
          </div>
        ) : (
          <RiskLoadingContent />
        )}
      </Screen>
    );

  const primaryAddress = current
    ? getPrimaryAddress(current.input.address).trim()
    : (query.data?.address ?? '');
  const detailAddress = current?.input.detail ?? query.data?.detailAddress ?? '';
  const canContinue = Boolean(selectedFloor && selectedFloor !== 'SECOND_OR_ABOVE');

  async function proceed(destination: 'inspection' | 'guide') {
    if (busy.current || !assessmentId || !data || data.status !== 'COMPLETED' || !selectedFloor)
      return;
    const path =
      destination === 'inspection'
        ? PATHS.inspectionApply
        : generatePath(PATHS.guideLoading, { assessmentId });
    if (current) {
      navigate(path);
      return;
    }
    if (id === null || !primaryAddress || !detailAddress.trim()) return;

    busy.current = true;
    setContinuing(true);
    setError('');
    try {
      const sameAddress =
        address &&
        getPrimaryAddress(address).trim() === primaryAddress &&
        detail.trim() === detailAddress.trim();
      const position =
        sameAddress && coordinates ? coordinates : await getAddressCoordinates(primaryAddress);
      if (!active.current) return;
      setResult({
        ...data,
        id,
        source: 'api',
        input: {
          address: sameAddress
            ? address
            : { roadAddress: primaryAddress, jibunAddress: '', buildingName: '', zipCode: '' },
          coordinates: position,
          detail: detailAddress,
          floor: selectedFloor,
        },
      });
      navigate(path);
    } catch (failure) {
      if (active.current)
        setError(failure instanceof Error ? failure.message : '주소 좌표를 확인하지 못했어요.');
    } finally {
      busy.current = false;
      if (active.current) setContinuing(false);
    }
  }

  return (
    <RiskResultView
      address={primaryAddress}
      detail={detailAddress}
      floor={selectedFloor}
      level={data.level}
      reasons={data.reasons}
      floodRecord={data.floodRecord}
      disclaimer={data.disclaimer}
      missingFloor={!selectedFloor}
      error={error}
      continuing={continuing}
      onBack={back}
      onCheckAddress={checkAddress}
      onInspection={canContinue ? () => void proceed('inspection') : undefined}
      onGuide={canContinue ? () => void proceed('guide') : undefined}
    />
  );
}

function IconList({
  items,
  className,
  iconClassName = 'bg-soft',
}: {
  items: readonly (readonly [string, string])[];
  className?: string;
  iconClassName?: string;
}) {
  return (
    <ul
      className={cn(
        cardStyle,
        'mt-2.5 flex flex-col gap-[9px] px-3 py-3 text-[15px] leading-6',
        className,
      )}
    >
      {items.map(([icon, label]) => (
        <li key={label} className="flex items-center gap-3">
          <span
            className={cn(
              'grid size-[34px] shrink-0 place-items-center rounded-[9px]',
              iconClassName,
            )}
          >
            <img src={icon} alt="" width={20} height={20} />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

function hideResultLine(value: string | undefined, hiddenLine: string) {
  return value
    ?.split(/\r?\n/)
    .filter((line) => line.trim() !== hiddenLine)
    .join('\n')
    .trim();
}

export function RiskResultView({
  address,
  detail,
  floor,
  level,
  reasons = [],
  floodRecord,
  disclaimer,
  missingFloor,
  error,
  continuing,
  onBack,
  onCheckAddress = onBack,
  onInspection,
  onGuide,
}: {
  address: string;
  detail: string;
  floor: ResidenceFloor | null;
  level: RiskLevel;
  reasons?: string[];
  floodRecord?: string;
  disclaimer?: string;
  missingFloor?: boolean;
  error?: string;
  continuing?: boolean;
  onBack: () => void;
  onCheckAddress?: () => void;
  onInspection?: () => void;
  onGuide?: () => void;
}) {
  const upper = floor === 'SECOND_OR_ABOVE';
  const low = level === 'LOW';
  const grade = grades[level];
  const visibleFloodRecord = hideResultLine(floodRecord, '침수 기록 없음 (안전을 뜻하지 않음)');
  const visibleDisclaimer = hideResultLine(
    disclaimer,
    '지역 상대 취약도이며 개별 주택의 침수 위험도나 침수 확률이 아닙니다.',
  );

  return (
    <Screen
      header={{ title, onBack }}
      tab="home"
      className="pt-3.5"
      bottom={
        upper ? (
          <Link
            to={PATHS.home}
            className="bg-primary text-on-primary text-button flex h-13 items-center justify-center rounded-md px-4 active:brightness-90"
          >
            홈으로 돌아가기
          </Link>
        ) : (
          <>
            {error && (
              <p className="text-body text-danger" role="alert">
                {error}
              </p>
            )}
            {low ? (
              <>
                <Button loading={continuing} disabled={!onGuide} onClick={onGuide}>
                  예방 가이드 확인하기
                </Button>
                <Button
                  variant="secondary"
                  disabled={!onInspection || continuing}
                  onClick={onInspection}
                  className="disabled:border-border disabled:bg-surface disabled:text-ink disabled:border"
                >
                  현장점검 신청하기
                </Button>
              </>
            ) : (
              <Button loading={continuing} disabled={!onInspection} onClick={onInspection}>
                현장점검 신청하기
              </Button>
            )}
          </>
        )
      }
    >
      <section className={cn(cardStyle, 'min-h-[77px] px-[15px] py-2.5 wrap-break-word')}>
        <h2 className="text-[17px] leading-7 font-bold">{address}</h2>
        <p className="text-body text-body-text font-medium">
          {[detail, floor && floorLabels[floor]].filter(Boolean).join(' · ')}
        </p>
      </section>
      {upper ? (
        <>
          <section className="risk-upper-notice mt-4 flex min-h-[110px] items-center gap-3 rounded-xl px-3.5 py-[15px]">
            <div
              aria-hidden
              className="risk-upper-house relative h-20 w-[73px] shrink-0 rounded-xl"
            >
              <img src={upperHouseRoof} alt="" className="absolute top-5 left-[11px]" />
              <img src={upperHouseRoof} alt="" className="absolute top-[25px] left-3 rotate-180" />
              <div className="bg-surface absolute top-[43px] left-[19px] h-[34px] w-9 rounded-[3px]">
                <span className="risk-upper-house-opening absolute top-2 left-[7px] size-[9px] rounded-xs" />
                <span className="risk-upper-house-opening absolute bottom-0 left-[22px] h-[19px] w-[9px] rounded-xs" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="risk-upper-notice-title text-[17px] leading-[23px] font-bold">
                2층 이상이어도 주의가 필요해요
              </h2>
              <p className="text-ink mt-1 text-[13.5px] leading-[21px]">
                건물 출입구와 지하 공간,
                <br />
                주변 도로는 침수될 수 있어요.
              </p>
            </div>
          </section>
          <section className="mt-4">
            <h2 className="text-[17px] leading-6 font-bold">주변 지역에서 확인할 사항</h2>
            <IconList
              items={surroundingInfo}
              className="risk-upper-surroundings bg-surface"
              iconClassName="risk-result-region-icon"
            />
          </section>
          <section className="mt-3">
            <h2 className="text-[17px] leading-6 font-bold">일반 예방 가이드</h2>
            <ul className="risk-upper-guide mt-2 flex min-h-[110px] flex-col gap-2 rounded-xl px-[18px] py-2.5 text-[15px] leading-6">
              {prevention.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <img src={upperCheck} alt="" width={19} height={19} className="shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <section className={cn(cardStyle, 'mt-4 grid min-h-[110px] grid-cols-[48%_52%] py-1')}>
            <div className="border-border/70 border-r py-1 pl-[15px]">
              <p className="text-body font-semibold">지역 상대 취약도</p>
              <p
                className={cn(
                  'mt-3 flex items-center gap-2 text-[27px] leading-9 font-bold',
                  grade.color,
                )}
              >
                <span aria-hidden className="mx-[5px] size-2.5 shrink-0 rounded-full bg-current" />
                {grade.label}
              </p>
            </div>
            <div className="px-3 py-1 sm:px-4">
              <p className="text-body font-semibold">다음 단계 안내</p>
              <p className="risk-result-next-step mt-4 text-[15px] leading-[22px] font-bold">
                {low ? '예방 가이드 확인 권장' : '현장점검 신청 권장'}
              </p>
            </div>
          </section>
          <section className="mt-4">
            <h2 className="text-[17px] leading-6 font-bold">분석에 사용한 지역 정보</h2>
            <IconList
              items={regionalInfo}
              className="gap-3.5 py-3.5"
              iconClassName="risk-result-region-icon"
            />
            <p className="risk-result-region-note text-caption mx-[9px] mt-2.5 leading-5">
              분석 결과는 지역 정보에 기반한 참고 자료예요.
              <br />
              실제 침수 위험은 현장 상황에 따라 달라질 수 있어요.
            </p>
          </section>
        </>
      )}
      {(reasons.length > 0 || visibleFloodRecord || visibleDisclaimer) && (
        <section className="text-body text-body-text mt-5 flex flex-col gap-2">
          {reasons.length > 0 && (
            <>
              <h2 className="text-section">분석 근거</h2>
              <ul className="list-disc pl-5">
                {reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </>
          )}
          {visibleFloodRecord && <p>{visibleFloodRecord}</p>}
          {visibleDisclaimer && <p className="text-muted">{visibleDisclaimer}</p>}
        </section>
      )}
      {missingFloor && (
        <div className="text-body text-muted mt-5">
          <p>
            이 결과에서 거주 층을 확인할 수 없어요. 다음 단계로 진행하려면 주소와 거주 층을 다시
            확인해 주세요.
          </p>
          <Button
            variant="text"
            size="md"
            fullWidth={false}
            className="px-0"
            onClick={onCheckAddress}
          >
            주소 확인하기
          </Button>
        </div>
      )}
    </Screen>
  );
}
