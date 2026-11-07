import type { StatusTone } from '@/components/ui';
import type {
  ApplicationStage,
  ExistingFacility,
  InspectionNeed,
  LandlordConsentStatus,
  NotificationType,
  RiskFactorCode,
  RiskLevel,
  SupportDecision,
  Tenure,
  VisitTimeSlot,
  VulnerabilityType,
  WaterEntryPoint,
  YesNoUnknown,
} from '@/types/domain';

/**
 * enum 코드 → 화면 표시 문구/색 매핑.
 * 화면에서 한국어 문자열을 하드코딩하지 말고 여기서 가져다 쓰세요.
 */

/** 취약도 결과 화면(02 / 01-낮음) 문구. textClass 는 등급 글자 색 */
export const RISK_LEVEL: Record<
  RiskLevel,
  { label: string; tone: StatusTone; textClass: string; headline: string; message: string }
> = {
  HIGH: {
    label: '높음',
    tone: 'danger',
    textClass: 'text-danger',
    headline: '취약도가 높아요',
    message: '바로 현장점검을 신청해보세요!',
  },
  CAUTION: {
    label: '주의',
    tone: 'warning',
    textClass: 'text-warning',
    headline: '주의가 필요해요',
    message: '현장점검으로 실제 취약지점을 확인해보세요.',
  },
  LOW: {
    label: '낮음',
    tone: 'primary',
    textClass: 'text-ink',
    headline: '취약도가 낮아도 예방은 필요해요',
    message:
      '침수 위험이 전혀 없다는 뜻은 아니에요. 먼저 예방 가이드를 따라 해보고, 해결되지 않으면 현장점검을 신청할 수 있어요.',
  },
};

/** RISK-06 현장점검 필요도. 명세의 '정보 확인'은 Figma 화면 문구 '예방 가이드 먼저'로 표시 */
export const INSPECTION_NEED: Record<InspectionNeed, string> = {
  PRIORITY: '우선점검 권장',
  RECOMMENDED: '점검 권장',
  INFO: '예방 가이드 먼저',
};

export const RISK_FACTOR_LABEL: Record<RiskFactorCode, string> = {
  LOW_LYING: '저지대',
  DRAINAGE_CAPACITY: '배수',
  FLOOD_HISTORY: '과거 침수',
  ROAD_SLOPE: '도로 경사',
  HEAVY_RAINFALL: '강우',
};

export const TENURE_OPTIONS = [
  { value: 'OWNER', label: '소유자' },
  { value: 'TENANT', label: '세입자' },
  { value: 'OTHER', label: '기타' },
] as const satisfies readonly { value: Tenure; label: string }[];

export const TENURE_LABEL = Object.fromEntries(
  TENURE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Tenure, string>;

export const YES_NO_UNKNOWN_OPTIONS = [
  { value: 'YES', label: '있음' },
  { value: 'NO', label: '없음' },
  { value: 'UNKNOWN', label: '모름' },
] as const satisfies readonly { value: YesNoUnknown; label: string }[];

export const WATER_ENTRY_OPTIONS = [
  { value: 'WINDOW', label: '창문' },
  { value: 'ENTRANCE', label: '출입구' },
  { value: 'BATHROOM', label: '화장실' },
  { value: 'DRAIN', label: '배수구' },
  { value: 'OTHER', label: '기타' },
  { value: 'UNKNOWN', label: '모름' },
] as const satisfies readonly { value: WaterEntryPoint; label: string }[];

export const EXISTING_FACILITY_OPTIONS = [
  { value: 'NONE', label: '없음' },
  { value: 'WATER_BARRIER', label: '물막이판' },
  { value: 'BACKFLOW_PREVENTER', label: '역류방지시설' },
  { value: 'WINDOW_GUARD', label: '창문 차수시설' },
  { value: 'UNKNOWN', label: '모름' },
] as const satisfies readonly { value: ExistingFacility; label: string }[];

export const VISIT_TIME_OPTIONS = [
  { value: 'MORNING', label: '오전 9~12시' },
  { value: 'AFTERNOON', label: '오후 1~6시' },
  { value: 'ANYTIME', label: '상관없음' },
] as const satisfies readonly { value: VisitTimeSlot; label: string }[];

export const VISIT_TIME_LABEL = Object.fromEntries(
  VISIT_TIME_OPTIONS.map((o) => [o.value, o.label]),
) as Record<VisitTimeSlot, string>;

export const VULNERABILITY_TYPE_LABEL: Record<VulnerabilityType, string> = {
  WINDOW_OPENING: '창문·개구부',
  ENTRANCE: '출입구',
  SEWER_BACKFLOW: '하수 역류',
  STRUCTURE_OTHER: '기타 구조',
};

/** 신청 단계 → 상태 라벨 · 진행 허브 문구 */
export const APPLICATION_STAGE: Record<
  ApplicationStage,
  { label: string; headline: string; tone: StatusTone }
> = {
  INSPECTION_RECEIVED: { label: '접수', headline: '방문 일정을 확인하고 있어요.', tone: 'primary' },
  VISIT_SCHEDULED: {
    label: '방문일정 확정',
    headline: '전문가 방문 일정이 정해졌어요.',
    tone: 'primary',
  },
  INSPECTION_IN_PROGRESS: {
    label: '점검 진행 중',
    headline: '현장점검을 진행하고 있어요.',
    tone: 'primary',
  },
  INSPECTION_RESULT_PENDING: {
    label: '결과 공개 대기',
    headline: '현장점검 결과 공개를 기다리고 있어요.',
    tone: 'primary',
  },
  INSPECTION_COMPLETED: {
    label: '점검 완료',
    headline: '현장점검 결과가 나왔어요.',
    tone: 'success',
  },
  SUPPORT_RECEIVED: {
    label: '지원 접수',
    headline: '지원 신청이 정상적으로 접수됐어요.',
    tone: 'primary',
  },
  SUPPORT_REVIEW: {
    label: '지원 검토 중',
    headline: '제출한 내용을 검토하고 있어요.',
    tone: 'primary',
  },
  LANDLORD_CONSENT_REQUIRED: {
    label: '동의 필요',
    headline: '임대인 동의를 기다리고 있어요.',
    tone: 'warning',
  },
  SUPPORT_APPROVED: { label: '승인', headline: '지원 대상자로 확인됐어요.', tone: 'success' },
  SUPPORT_REJECTED: {
    label: '지원 미승인',
    headline: '이번 지원은 진행하기 어려워요.',
    tone: 'danger',
  },
  CONSTRUCTION_SCHEDULED: {
    label: '시공 예정',
    headline: '예방시설 시공 일정이 정해졌어요.',
    tone: 'primary',
  },
  CONSTRUCTION_IN_PROGRESS: {
    label: '시공 진행',
    headline: '예방시설을 설치하고 있어요.',
    tone: 'primary',
  },
  COMPLETED: { label: '전체 완료', headline: '예방시설 설치가 모두 끝났어요.', tone: 'success' },
};

export const SUPPORT_STEPS = ['접수', '동의', '결과', '일정'] as const;

export const LANDLORD_CONSENT_LABEL: Record<LandlordConsentStatus, string> = {
  NOT_REQUIRED: '불필요',
  PENDING: '확인 중',
  VERIFIED: '확인 완료',
};

export const SUPPORT_DECISION_LABEL: Record<SupportDecision, string> = {
  PENDING: '지원 검토 중',
  APPROVED: '지원 승인',
  REJECTED: '지원 미승인',
};

export const NOTIFICATION_LABEL: Record<NotificationType, string> = {
  INSPECTION_RECEIVED: '점검 신청 접수',
  VISIT_SCHEDULED: '점검 일정 확정',
  VISIT_REMINDER: '점검 예정',
  RESULT_REGISTERED: '점검 결과 등록',
  SUPPORT_RECEIVED: '지원 신청 접수',
  SUPPORT_DECIDED: '지원 결과',
  CONSTRUCTION_SCHEDULED: '시공 일정 확정',
  CONSTRUCTION_COMPLETED: '시공 완료',
};
