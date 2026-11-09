import { useEffect, useRef, useState } from 'react';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router';
import { getAddressCoordinates } from '@/api/risk';
import { parseAssessmentId, useRiskAssessment } from '@/api/riskAnalysis';
import regionEnvironment from '@/assets/risk/region-environment.svg';
import regionSlope from '@/assets/risk/region-slope.svg';
import regionTerrain from '@/assets/risk/region-terrain.svg';
import riskCaution from '@/assets/risk/risk-caution.svg';
import riskHigh from '@/assets/risk/risk-high.svg';
import riskLow from '@/assets/risk/risk-low.svg';
import upperCheck from '@/assets/risk/upper-check.svg';
import upperDrain from '@/assets/risk/upper-drain.svg';
import upperHome from '@/assets/risk/upper-home.svg';
import upperTerrain from '@/assets/risk/upper-terrain.svg';
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

const title = '지역 취약도 결과';
const floorLabels: Record<ResidenceFloor, string> = {
  BASEMENT: '반지하 / 지하',
  FIRST: '1층',
  SECOND_OR_ABOVE: '2층 이상',
};
const grades = {
  HIGH: { label: '높음', color: 'text-danger', icon: riskHigh },
  CAUTION: { label: '보통', color: 'text-warning', icon: riskCaution },
  LOW: { label: '낮음', color: 'text-primary', icon: riskLow },
};
const regionalInfo = [
  [regionTerrain, '지형 · 주변 대비 높이'],
  [regionSlope, '경사 · 땅의 기울기'],
  [regionEnvironment, '주변 환경 · 건물·도로 비율'],
] as const;
const surroundingInfo = [
  [upperTerrain, '지형 · 저지대와 주변 도로 확인'],
  [upperDrain, '배수 · 빗물받이 막힘 여부 확인'],
  [upperWeather, '기상 · 호우특보와 재난문자 확인'],
] as const;
const prevention = [
  '지하 주차장·침수 도로에 접근하지 않기',
  '대피 경로와 비상 연락처 확인하기',
  '호우특보 때 외출을 줄이고 안내 확인하기',
];

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
  const back = () => navigate(address && coordinates ? PATHS.addressDetail : PATHS.addressSearch);

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
            <Button variant="secondary" onClick={back}>
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
      onInspection={canContinue ? () => void proceed('inspection') : undefined}
      onGuide={canContinue ? () => void proceed('guide') : undefined}
    />
  );
}

function IconList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <ul className="text-body flex flex-col gap-3">
      {items.map(([icon, label]) => (
        <li key={label} className="flex items-center gap-3">
          <img src={icon} alt="" width={20} height={20} className="shrink-0" />
          {label}
        </li>
      ))}
    </ul>
  );
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
  onInspection?: () => void;
  onGuide?: () => void;
}) {
  const upper = floor === 'SECOND_OR_ABOVE';
  const low = level === 'LOW';
  const grade = grades[level];

  return (
    <Screen
      header={{ title, onBack }}
      tab="home"
      bottom={
        !upper &&
        !low && (
          <>
            {error && (
              <p className="text-body text-danger" role="alert">
                {error}
              </p>
            )}
            <Button loading={continuing} disabled={!onInspection} onClick={onInspection}>
              현장점검 신청하기
            </Button>
          </>
        )
      }
    >
      <section className="pt-6">
        <h2 className="text-[18px] leading-7 font-bold">{address}</h2>
        <p className="text-body-text mt-1 text-[15px] leading-[22px] font-medium">
          {[detail, floor && floorLabels[floor]].filter(Boolean).join(' · ')}
        </p>
      </section>
      {upper ? (
        <>
          <section className="mt-7.5">
            <h2 className="text-primary flex items-center gap-2 text-[22px] leading-7 font-bold">
              <img src={upperHome} alt="" width={20} height={20} className="shrink-0" />
              주변 환경도 함께 확인해요
            </h2>
            <p className="text-body text-body-text mt-2">
              거주 층만으로 우리 집의 위험을 판단할 수 없어요.
              <br />
              지역 분석은 문턱·창문 등 집의 조건을 반영하지 않으므로, 주변 환경과 주택 상태를 함께
              확인해요.
            </p>
          </section>
          <section className="mt-8">
            <h2 className="text-[18px] leading-6 font-bold">주변 지역에서 확인할 정보</h2>
            <p className="text-body text-muted mt-2">
              거주 층과 별개로 주변 도로와 공용공간의 위험을
              <br />
              확인해 주세요.
            </p>
            <IconList items={surroundingInfo} />
          </section>
          <section className="mt-9">
            <h2 className="text-[18px] leading-6 font-bold">일반 예방 가이드</h2>
            <ul className="text-body bg-soft mt-3 flex flex-col gap-3 rounded-md p-4">
              {prevention.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <img src={upperCheck} alt="" width={18} height={18} className="shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <section
            className={cn(
              'mt-8 grid',
              low ? 'grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'grid-cols-2',
            )}
          >
            <div className="border-border border-r pr-3">
              <p className="text-section font-semibold">지역 상대 취약도</p>
              <p className={cn('text-risk mt-3 flex items-center gap-2', grade.color)}>
                <img src={grade.icon} alt="" width={20} height={20} className="shrink-0" />
                {grade.label}
              </p>
            </div>
            <div className={low ? 'pl-6' : 'pl-4'}>
              <p className="text-section font-semibold">다음 단계 안내</p>
              <p className="text-primary mt-3 text-[18px] leading-6 font-bold">
                {low ? '예방 가이드 먼저' : '점검 권장'}
              </p>
            </div>
          </section>
          <section className="mt-[clamp(3rem,12dvh,100px)]">
            <h2 className="mb-3 text-[18px] leading-6 font-bold">분석에 사용한 지역 정보</h2>
            <IconList items={regionalInfo} />
          </section>
        </>
      )}
      {(reasons.length > 0 || floodRecord || disclaimer) && (
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
          {floodRecord && <p>{floodRecord}</p>}
          {disclaimer && <p className="text-muted">{disclaimer}</p>}
        </section>
      )}
      {missingFloor && (
        <div className="text-body text-muted mt-5">
          <p>
            이 결과에서 거주 층을 확인할 수 없어요. 다음 단계로 진행하려면 주소와 거주 층을 다시
            확인해 주세요.
          </p>
          <Button variant="text" size="md" fullWidth={false} className="px-0" onClick={onBack}>
            주소 확인하기
          </Button>
        </div>
      )}
      {low && !upper && (
        <div className="mt-16 flex flex-col gap-5 pt-4 pb-4">
          {error && (
            <p className="text-body text-danger" role="alert">
              {error}
            </p>
          )}
          <Button
            variant="secondary"
            disabled={!onInspection || continuing}
            onClick={onInspection}
            className="disabled:border-border disabled:bg-surface disabled:text-ink disabled:border"
          >
            가이드 없이 바로 현장점검 신청하기
          </Button>
          <Button loading={continuing} disabled={!onGuide} onClick={onGuide}>
            예방 가이드 보기
          </Button>
        </div>
      )}
    </Screen>
  );
}
