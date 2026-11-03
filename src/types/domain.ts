/**
 * 도메인 타입 — 노션 기능명세서(RISK / INSPECTION / STATUS / RESULT / SUPPORT / CONSTRUCTION / NOTI) 기준.
 *
 * ⚠️ 백엔드 API 스펙 확정 전 가안입니다. enum 값(영문 코드)과 필드명은 백엔드와 맞춘 뒤 이 파일만 고치면
 *    화면 쪽은 constants/labels.ts 를 통해 한국어로 표시되므로 영향이 최소화됩니다.
 */

export type ID = string;
/** ISO 8601 문자열 (예: 2026-09-07T09:00:00+09:00) */
export type ISODateString = string;

/* ───────────────────────── 1. 주소 · 침수 취약도 (RISK-01 ~ 09) ───────────────────────── */

/** RISK-01 주소 검색 결과 (도로명주소 API 응답 중 필요한 필드) */
export interface AddressCandidate {
  roadAddress: string; // 도로명주소
  jibunAddress: string; // 지번주소
  zipCode: string;
  buildingName?: string;
  /** 건물관리번호 — 건축물대장 조회(RISK-02) 키 */
  buildingManagementNo: string;
}

/** RISK-02 주택 기본정보 */
export interface HouseInfo {
  address: string;
  /** 반지하·지하층 여부 */
  isSemiBasement: boolean;
  floorLabel: string; // "반지하", "지하 1층" 등 표시용
  builtYear?: number;
}

/** RISK-04 침수 취약도 — 확률(%) 대신 등급으로만 표현 (기획 원칙) */
export type RiskLevel = 'HIGH' | 'CAUTION' | 'LOW';

/** RISK-06 현장점검 필요도 */
export type InspectionNeed = 'PRIORITY' | 'RECOMMENDED' | 'INFO';

/** RISK-05 주요 위험요인 */
export type RiskFactorCode =
  | 'LOW_LYING' // 저지대 · 주변보다 낮은 지형
  | 'DRAINAGE_CAPACITY' // 배수 · 우수관로 용량 부족
  | 'FLOOD_HISTORY' // 과거 침수 · 인근 신청 다수
  | 'ROAD_SLOPE' // 도로 경사
  | 'HEAVY_RAINFALL'; // 강우량

export interface RiskFactor {
  code: RiskFactorCode;
  description: string;
}

/** RISK-03 분석 결과 (취약도 결과 화면 전체 데이터) */
export interface RiskAssessment {
  id: ID;
  house: HouseInfo;
  riskLevel: RiskLevel;
  inspectionNeed: InspectionNeed;
  factors: RiskFactor[];
  analyzedAt: ISODateString;
  /** RISK-08 예상 지원정보 (있을 때만) */
  expectedSupport?: ExpectedSupport;
}

/** RISK-08 예상 지원 — "물막이판 무상 설치(예상 0원) 유력, 담당자 확인 후 확정" */
export interface ExpectedSupport {
  programName: string;
  facility: string;
  estimatedCost: number; // 원
  note: string;
}

/* ───────────────────────── 예방 가이드 (RISK-07 · GUIDE) ───────────────────────── */

export interface GuideItem {
  id: ID;
  title: string;
  description: string;
  estimatedMinutes: number;
  done: boolean;
}

export interface PreventionGuide {
  id: ID;
  assessmentId: ID;
  items: GuideItem[];
}

/** 05 미해결 사유 */
export type UnresolvedReason = 'WINDOW_ENTRANCE' | 'DRAIN_BATHROOM' | 'OTHER';

/* ───────────────────────── 2. 현장점검 신청 (INSPECTION-01 ~ 10) ───────────────────────── */

export type Tenure = 'OWNER' | 'TENANT' | 'OTHER'; // 소유자 / 세입자 / 기타
export type YesNoUnknown = 'YES' | 'NO' | 'UNKNOWN'; // 있음 / 없음 / 모름

/**
 * INSPECTION-02 물 유입 위치 — 명세: 창문·출입구·배수구·기타·모름
 * Figma(03 현장점검 신청)에는 '화장실'이 추가되어 있어 포함했습니다.
 */
export type WaterEntryPoint = 'WINDOW' | 'ENTRANCE' | 'BATHROOM' | 'DRAIN' | 'OTHER' | 'UNKNOWN';

/** INSPECTION-04 기존 침수방지시설 */
export type ExistingFacility =
  'NONE' | 'WATER_BARRIER' | 'BACKFLOW_PREVENTER' | 'WINDOW_GUARD' | 'UNKNOWN';

/** INSPECTION-05 방문 가능 시간대 */
export type VisitTimeSlot = 'MORNING' | 'AFTERNOON' | 'ANYTIME';

export interface InspectionRequestInput {
  assessmentId?: ID;
  address: string;
  applicantName: string;
  phone: string;
  tenure: Tenure;
  floodExperience: YesNoUnknown; // INSPECTION-01
  waterEntryPoints: WaterEntryPoint[]; // INSPECTION-02 (복수 선택)
  photos: File[]; // INSPECTION-03
  existingFacility: ExistingFacility; // INSPECTION-04
  reason?: string; // 점검 요청 사유 (선택)
  preferredDate: string; // INSPECTION-05 (YYYY-MM-DD)
  preferredTimeSlot: VisitTimeSlot;
}

/* ───────────────────────── 3. 진행상태 (STATUS-01 ~ 06) ───────────────────────── */

/**
 * 신청 1건이 거치는 전체 단계. 신청 상세 · 진행 허브(06-1)의 "현재 진행 상황"을 결정합니다.
 * 기획 플로우: 점검 신청 → 일정 확정 → 현장점검 → 결과 → 지원 신청 → 검토/동의 → 승인 → 시공 → 완료
 */
export type ApplicationStage =
  | 'INSPECTION_RECEIVED' // 접수 (방문 일정 확인 중)
  | 'VISIT_SCHEDULED' // 방문일정 확정
  | 'INSPECTION_COMPLETED' // 현장점검 완료 · 결과 공개
  | 'SUPPORT_RECEIVED' // 지원 신청 접수
  | 'SUPPORT_REVIEW' // 행정 검토 중
  | 'LANDLORD_CONSENT_REQUIRED' // 임대인 동의 필요
  | 'SUPPORT_APPROVED' // 지원 승인
  | 'SUPPORT_REJECTED' // 지원 미승인
  | 'CONSTRUCTION_SCHEDULED' // 시공 예정
  | 'CONSTRUCTION_IN_PROGRESS' // 시공 진행
  | 'COMPLETED'; // 전체 완료

export interface VisitSchedule {
  date: ISODateString;
  timeLabel: string; // "오전 9~12시"
  inspectorName?: string;
  confirmed: boolean;
}

/** 신청 목록/상세 (STATUS-01, 02) */
export interface ApplicationSummary {
  id: ID; // 접수번호 "000001"
  title: string;
  address: string;
  stage: ApplicationStage;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ApplicationDetail extends ApplicationSummary {
  request: Omit<InspectionRequestInput, 'photos'> & { photoUrls: string[] };
  visit?: VisitSchedule; // STATUS-03
  hasResult: boolean; // STATUS-06
}

/* ───────────────────────── 4. 점검 결과 · 맞춤 예방안 (RESULT-01 ~ 08) ───────────────────────── */

/** 기획서 STEP 3 대표 점검 유형 */
export type VulnerabilityType =
  'WINDOW_OPENING' | 'ENTRANCE' | 'SEWER_BACKFLOW' | 'STRUCTURE_OTHER';

/** STEP 4 해결 방식 분기 — 개별 주택 문제 vs 지역·공공 인프라 문제 */
export type ResolutionScope = 'INDIVIDUAL' | 'REGIONAL';

export interface VulnerablePoint {
  id: ID;
  type: VulnerabilityType; // RESULT-02
  title: string;
  detail: string; // RESULT-03
  photoUrls: string[]; // RESULT-04
}

export interface Recommendation {
  id: ID;
  facility: string; // "현관 물막이판"
  method: string;
  relatedPointIds: ID[];
}

export interface InspectionResult {
  applicationId: ID;
  inspectedAt: ISODateString;
  summary: string;
  scope: ResolutionScope;
  points: VulnerablePoint[];
  recommendations: Recommendation[]; // RESULT-05
  supportEligibility: 'ELIGIBLE' | 'CHECK_REQUIRED' | 'NOT_ELIGIBLE'; // RESULT-06
}

/* ───────────────────────── 5. 지원 신청 (SUPPORT-01 ~ 09) ───────────────────────── */

/** 신청 조건·준비 서류 한 줄 ("현장점검이 완료된 주택" + 설명) */
export interface SupportRequirement {
  title: string;
  description: string;
}

export interface SupportProgram {
  id: ID;
  name: string; // "침수 예방시설 설치 지원"
  description: string; // 04-1 사업 소개
  target: string; // SUPPORT-01 지원 대상
  benefit: string; // 지원 내용
  conditions: SupportRequirement[]; // SUPPORT-02
  requiredDocuments: SupportRequirement[]; // SUPPORT-03
}

export interface SupportApplicationInput {
  applicationId: ID;
  programId: ID;
  facility: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: VisitTimeSlot;
  documents: File[]; // SUPPORT-06
}

/**
 * SUPPORT-07 동의·증빙 자료 상태.
 * 세입자는 임대인 동의서(04-6), 소유자는 주택 소유 증명서(04-7)를 제출합니다.
 */
export type ConsentStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'SUBMITTED' | 'CONFIRMED';

export interface SubmittedFile {
  name: string;
  url: string;
}

/* ───────────────────────── 6. 지원 · 시공 진행 (CONSTRUCTION-01 ~ 07) ───────────────────────── */

export type SupportDecision = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ConstructionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export interface SupportProgress {
  applicationId: ID;
  programName: string;
  decision: SupportDecision; // CONSTRUCTION-02
  consent: ConsentStatus; // CONSTRUCTION-03
  consentFile?: SubmittedFile; // 04-8 제출 완료
  rejectReason?: string;
  submittedAt: ISODateString;
  facility: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: VisitTimeSlot;
  /** 승인 후 등록된 시공 일정. 없으면 일정 조율 중(04-8) */
  scheduledAt?: ISODateString;
}

export interface Construction {
  applicationId: ID;
  status: ConstructionStatus; // CONSTRUCTION-05
  facility: string;
  scheduledAt?: ISODateString; // CONSTRUCTION-04
  contractor?: string;
  completedAt?: ISODateString;
  resultPhotoUrls: string[]; // CONSTRUCTION-06
}

/* ───────────────────────── 7. 알림 (NOTI-01 ~ 08) ───────────────────────── */

export type NotificationType =
  | 'INSPECTION_RECEIVED' // NOTI-01
  | 'VISIT_SCHEDULED' // NOTI-02
  | 'VISIT_REMINDER' // NOTI-03
  | 'RESULT_REGISTERED' // NOTI-04
  | 'SUPPORT_RECEIVED' // NOTI-05
  | 'SUPPORT_DECIDED' // NOTI-06
  | 'CONSTRUCTION_SCHEDULED' // NOTI-07
  | 'CONSTRUCTION_COMPLETED'; // NOTI-08

export interface AppNotification {
  id: ID;
  type: NotificationType;
  applicationId: ID;
  title: string;
  body: string;
  createdAt: ISODateString;
  read: boolean;
}
