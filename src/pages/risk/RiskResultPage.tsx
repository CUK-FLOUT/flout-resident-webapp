import { AlertTriangle, Droplet, MapPin, Mountain, CloudRain, type LucideIcon } from 'lucide-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useAssessment } from '@/api/risk';
import { Screen } from '@/components/layout';
import { Button, InfoCard } from '@/components/ui';
import { INSPECTION_NEED, RISK_FACTOR_LABEL, RISK_LEVEL } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { cn } from '@/lib/cn';
import { useInspectionDraft } from '@/stores/inspectionDraft';
import type { RiskFactorCode } from '@/types/domain';

/**
 * Figma: 02 취약도 결과 (1115:2530) · 01. 취약도 결과 - 낮음 (1115:4451)
 * 기능명세: RISK-04 취약도 · RISK-05 위험요인 · RISK-06 점검 필요도 · RISK-08 예상 지원 · RISK-09 점검 신청 진입
 *
 * 원칙: 확률(%) 대신 등급으로만 표현하고, AI 참고 결과임을 함께 안내합니다.
 * - 높음/주의 → 현장점검 신청 CTA
 * - 낮음     → 예방 가이드 먼저 (점검 신청은 보조 링크)
 */
const FACTOR_ICON: Record<RiskFactorCode, LucideIcon> = {
  LOW_LYING: AlertTriangle,
  DRAINAGE_CAPACITY: Droplet,
  FLOOD_HISTORY: MapPin,
  ROAD_SLOPE: Mountain,
  HEAVY_RAINFALL: CloudRain,
};

export default function RiskResultPage() {
  const { assessmentId } = useParams<'assessmentId'>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAssessment(assessmentId);
  const updateDraft = useInspectionDraft((s) => s.update);

  if (isLoading) {
    return (
      <Screen header={{ title: '취약도 결과' }}>
        <p className="pt-10 text-center text-body text-muted">결과를 불러오고 있어요…</p>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen
        header={{ title: '취약도 결과' }}
        bottom={<Button onClick={() => refetch()}>다시 시도</Button>}
      >
        <p className="pt-10 text-center text-body text-muted">결과를 불러오지 못했어요.</p>
      </Screen>
    );
  }

  const level = RISK_LEVEL[data.riskLevel];
  const isLow = data.riskLevel === 'LOW';

  const goInspection = () => {
    updateDraft({ assessmentId: data.id, address: data.house.address });
    navigate(PATHS.inspectionApply);
  };
  const goGuide = () => navigate(generatePath(PATHS.guideLoading, { assessmentId: data.id }));

  return (
    <Screen
      header={{ title: '취약도 결과' }}
      bottom={
        isLow ? (
          <>
            <Button variant="text" size="md" onClick={goInspection}>
              가이드 없이 바로 현장점검 신청하기
            </Button>
            <Button onClick={goGuide}>예방 가이드 보기</Button>
          </>
        ) : (
          <Button onClick={goInspection}>현장점검 신청하기</Button>
        )
      }
    >
      <section className="pt-4">
        <h2 className="text-heading text-ink">{data.house.address}</h2>
        <p className="mt-1 text-caption text-body-text">
          {data.house.floorLabel} 주택 · 주소 기반 참고 결과
        </p>
      </section>

      <section className="mt-8 grid grid-cols-2">
        <div className="flex flex-col gap-2 border-r border-border pr-4">
          <p className="text-label text-ink">침수 취약도</p>
          <p className={cn('text-risk', level.textClass)}>{level.label}</p>
        </div>
        <div className="flex flex-col gap-2 pl-4">
          <p className="text-label text-ink">현장 점검 필요도</p>
          <p className="text-section text-primary">{INSPECTION_NEED[data.inspectionNeed]}</p>
        </div>
      </section>

      <p className="mt-6 text-body text-body-text">
        취약도와 점검 필요도는 AI 참고 결과예요. 실제 취약지점과 필요한 시설은 전문가 현장점검으로
        확인해요.
      </p>

      <section className="mt-8">
        <h3 className="text-section text-ink">AI 분석에서 참고한 위험요인</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {data.factors.map((f) => {
            const Icon = FACTOR_ICON[f.code];
            return (
              <li key={f.code} className="flex items-center gap-3 text-body text-ink">
                <Icon size={20} className="shrink-0 text-primary" aria-hidden />
                {RISK_FACTOR_LABEL[f.code]} · {f.description}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className={cn('text-section', isLow ? 'text-primary' : level.textClass)}>
          {level.headline}
        </h3>
        <p className="mt-2 text-body text-ink">{level.message}</p>
      </section>

      {/* RISK-08 예상 지원정보 — "겁만 주고 끝나지 않게" 즉시 보상 제공 (기획 피드백 반영) */}
      {data.expectedSupport && (
        <InfoCard
          className="mt-6"
          eyebrow="예상 지원"
          title={`${data.expectedSupport.facility} 설치 지원 가능성`}
        >
          {data.expectedSupport.programName} 대상일 경우 예상 본인부담{' '}
          {data.expectedSupport.estimatedCost.toLocaleString()}원. {data.expectedSupport.note}
        </InfoCard>
      )}
    </Screen>
  );
}
