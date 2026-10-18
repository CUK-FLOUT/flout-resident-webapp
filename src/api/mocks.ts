import type {
  AddressCandidate,
  AppNotification,
  ApplicationDetail,
  ApplicationSummary,
  Construction,
  InspectionResult,
  PreventionGuide,
  RiskAssessment,
  SupportProgram,
  SupportProgress,
} from '@/types/domain';

/**
 * 백엔드 연결 전 화면 작업용 목업 데이터. (.env 에서 VITE_USE_MOCK=true)
 * Figma 화면의 예시 문구를 그대로 옮겼습니다.
 */

export const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const mockAddresses: AddressCandidate[] = [
  {
    roadAddress: '경기도 부천시 원미구 부천로 00',
    jibunAddress: '경기도 부천시 원미구 심곡동 000-0',
    zipCode: '14600',
    buildingManagementNo: '4119010100100000000000001',
  },
  {
    roadAddress: '경기도 부천시 소사구 소사로 00',
    jibunAddress: '경기도 부천시 소사구 소사본동 00-0',
    zipCode: '14700',
    buildingManagementNo: '4119010100100000000000002',
  },
];

export const mockAssessmentHigh: RiskAssessment = {
  id: 'ra-001',
  house: { address: '부천시 OO구 OO로 00', isSemiBasement: true, floorLabel: '반지하' },
  riskLevel: 'HIGH',
  inspectionNeed: 'RECOMMENDED',
  factors: [
    { code: 'LOW_LYING', description: '주변보다 낮은 지형' },
    { code: 'DRAINAGE_CAPACITY', description: '우수관로 용량 부족' },
    { code: 'FLOOD_HISTORY', description: '인근 신청 다수' },
  ],
  analyzedAt: '2026-10-18T10:00:00+09:00',
  expectedSupport: {
    programName: '침수 예방시설 설치 지원',
    facility: '물막이판',
    estimatedCost: 0,
    note: '부천시 지원사업 대상일 경우 무상 설치가 유력하며, 담당자 확인 후 최종 확정됩니다.',
  },
};

export const mockAssessmentLow: RiskAssessment = {
  ...mockAssessmentHigh,
  id: 'ra-002',
  riskLevel: 'LOW',
  inspectionNeed: 'INFO',
  factors: [{ code: 'ROAD_SLOPE', description: '완만해 빗물이 잠시 고일 수 있음' }],
  expectedSupport: undefined,
};

export const mockGuide: PreventionGuide = {
  id: 'g-001',
  assessmentId: 'ra-002',
  items: [
    {
      id: 'gi-1',
      title: '배수구·빗물받이 막힘 확인',
      description:
        '낙엽과 쓰레기를 치우고 물이 빠지는지 확인해 주세요. 덮개가 있는 곳은 열 수 있는 범위에서 살펴봐요.',
      estimatedMinutes: 5,
      done: false,
    },
    {
      id: 'gi-2',
      title: '전기·가전 높은 곳으로 옮기기',
      description:
        '멀티탭과 가전은 바닥보다 높은 곳으로 옮겨 주세요. 젖은 전기기기는 만지지 말고 안전을 먼저 확인해요.',
      estimatedMinutes: 10,
      done: false,
    },
  ],
};

export const mockApplications: ApplicationSummary[] = [
  {
    id: '000001',
    address: '부천시 OO구 OO로 00',
    stage: 'INSPECTION_RECEIVED',
    createdAt: '2026-09-01T10:00:00+09:00',
    updatedAt: '2026-09-01T10:00:00+09:00',
  },
  {
    id: '000002',
    address: '부천시 OO구 OO길 12',
    stage: 'SUPPORT_REVIEW',
    createdAt: '2026-08-12T10:00:00+09:00',
    updatedAt: '2026-09-03T10:00:00+09:00',
  },
];

export const mockApplicationDetail: ApplicationDetail = {
  ...mockApplications[0],
  request: {
    address: '부천시 OO구 OO로 00',
    applicantName: '고OO',
    phone: '010-1234-1234',
    tenure: 'TENANT',
    floodExperience: 'YES',
    waterEntryPoints: ['BATHROOM', 'DRAIN'],
    existingFacility: 'NONE',
    reason: '최근 배수구 역류가 있어 점검을 희망합니다.',
    preferredDate: '2026-09-07',
    preferredTimeSlot: 'MORNING',
    photoUrls: [],
  },
  hasResult: false,
};

export const mockResult: InspectionResult = {
  applicationId: '000002',
  inspectedAt: '2026-08-20T10:00:00+09:00',
  summary: '출입구를 통한 빗물 유입 위험이 확인됐어요.',
  scope: 'INDIVIDUAL',
  points: [
    {
      id: 'p-1',
      type: 'ENTRANCE',
      title: '낮은 출입구 높이',
      detail: '출입구 문턱이 도로면보다 낮아 집중호우 시 빗물이 유입될 수 있어요.',
      photoUrls: [],
    },
    {
      id: 'p-2',
      type: 'SEWER_BACKFLOW',
      title: '배수구 역류 가능성',
      detail: '욕실 배수구에 역류방지시설이 없어요.',
      photoUrls: [],
    },
  ],
  recommendations: [
    {
      id: 'r-1',
      facility: '현관 물막이판',
      method: '출입구 폭에 맞춘 탈착식 물막이판 설치',
      relatedPointIds: ['p-1'],
    },
    {
      id: 'r-2',
      facility: '역류방지시설',
      method: '욕실 배수구 역류방지 밸브 설치',
      relatedPointIds: ['p-2'],
    },
  ],
  supportEligibility: 'CHECK_REQUIRED',
};

export const mockSupportPrograms: SupportProgram[] = [
  {
    id: 'sp-1',
    name: '침수 예방시설 설치 지원',
    target: '부천시 반지하 주택 거주 세대',
    benefit: '물막이판·역류방지시설·개폐형 방범창 설치비 지원',
    conditions: [
      '부천시 소재 반지하 주택',
      '현장점검 결과 설치 필요 판정',
      '세입자는 임대인 동의 필요',
    ],
    requiredDocuments: ['신분증 사본', '임대차계약서 사본 (세입자)', '임대인 동의서 (세입자)'],
  },
];

export const mockSupportProgress: SupportProgress = {
  applicationId: '000002',
  programName: '침수 예방시설 설치 지원',
  decision: 'PENDING',
  landlordConsent: 'REQUIRED',
  submittedAt: '2026-09-03T10:00:00+09:00',
};

export const mockConstruction: Construction = {
  applicationId: '000002',
  status: 'SCHEDULED',
  facility: '출입구 물막이판',
  scheduledAt: '2026-10-21T10:00:00+09:00',
  contractor: 'OO시공',
  resultPhotoUrls: [],
};

export const mockNotifications: AppNotification[] = [
  {
    id: 'n-3',
    type: 'CONSTRUCTION_COMPLETED',
    applicationId: '000008',
    title: '예방시설 설치가 완료됐어요.',
    body: '최종 설치 사진과 시공 결과가 등록됐어요.',
    createdAt: '2026-10-18T09:00:00+09:00',
    read: false,
  },
  {
    id: 'n-2',
    type: 'SUPPORT_DECIDED',
    applicationId: '000002',
    title: '지원 대상자로 확인됐어요.',
    body: '시공 일정이 정해지면 다시 알려드릴게요.',
    createdAt: '2026-10-10T09:00:00+09:00',
    read: true,
  },
  {
    id: 'n-1',
    type: 'INSPECTION_RECEIVED',
    applicationId: '000001',
    title: '현장점검 신청이 접수됐어요.',
    body: '방문 일정이 정해지면 알려드릴게요.',
    createdAt: '2026-09-01T10:00:00+09:00',
    read: true,
  },
];
