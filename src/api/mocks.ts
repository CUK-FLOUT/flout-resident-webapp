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
    buildingName: '심곡주택',
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

/** 페이지네이션 검증용 주소 검색 데이터. */
export const mockAddressSearchExtra = Array.from({ length: 11 }, (_, i) => ({
  roadAddress: `경기도 부천시 원미구 중동로 ${i + 1}`,
  jibunAddress: `경기도 부천시 원미구 중동 ${i + 1}`,
  buildingName: '중동주택',
  zipCode: '14500',
}));

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
      title: '출입문 하단 틈 막기',
      description:
        '물막이판이나 모래주머니를 준비하고 출입문 아래 틈을 확인해 주세요. 설치 방법은 제품 안내를 따라요.',
      estimatedMinutes: 10,
      done: false,
    },
    {
      id: 'gi-3',
      title: '전기·가전 높은 곳으로 옮기기',
      description:
        '멀티탭과 가전은 바닥보다 높은 곳으로 옮겨 주세요. 젖은 전기기기는 만지지 말고 안전을 먼저 확인해요.',
      estimatedMinutes: 10,
      done: false,
    },
    {
      id: 'gi-4',
      title: '비상 연락처·대피 경로 확인',
      description:
        '가족과 관할 부서 연락처를 저장하고, 비가 많이 오면 이동할 수 있는 안전한 경로를 함께 확인해 주세요.',
      estimatedMinutes: 5,
      done: false,
    },
  ],
};

export const mockApplications: ApplicationSummary[] = [
  {
    id: '000001',
    title: '현장점검 · 침수 위험 점검 신청',
    address: '부천시 OO구 OO로 00',
    stage: 'INSPECTION_RECEIVED',
    createdAt: '2026-09-07T10:00:00+09:00',
    updatedAt: '2026-09-07T10:00:00+09:00',
  },
  {
    id: '000002',
    title: '지원 · 물막이판 설치 지원',
    address: '부천시 OO구 OO길 12',
    stage: 'SUPPORT_REVIEW',
    createdAt: '2026-10-07T10:00:00+09:00',
    updatedAt: '2026-10-07T10:00:00+09:00',
  },
  {
    id: '000004',
    title: '지원 · 물막이판 설치 지원',
    address: '부천시 OO구 OO길 30',
    stage: 'SUPPORT_REJECTED',
    createdAt: '2026-10-06T10:00:00+09:00',
    updatedAt: '2026-10-06T10:00:00+09:00',
  },
  {
    id: '000003',
    title: '시공 · 출입구 물막이판 설치',
    address: '부천시 OO구 OO로 24',
    stage: 'CONSTRUCTION_IN_PROGRESS',
    createdAt: '2026-10-06T10:00:00+09:00',
    updatedAt: '2026-10-06T10:00:00+09:00',
  },
  {
    id: '000008',
    title: '시공 · 출입구 물막이판',
    address: '부천시 OO구 OO로 84',
    stage: 'COMPLETED',
    createdAt: '2026-10-06T10:00:00+09:00',
    updatedAt: '2026-10-06T10:00:00+09:00',
  },
  {
    id: '000005',
    title: '현장점검 · 공개된 결과 확인',
    address: '부천시 OO구 OO로 48',
    stage: 'INSPECTION_COMPLETED',
    createdAt: '2026-10-06T10:00:00+09:00',
    updatedAt: '2026-10-06T10:00:00+09:00',
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
    description: '침수 예방을 위한 시설 설치와 관련해 지원 대상 여부를 검토할 수 있는 사업이에요.',
    target: '부천시 반지하 주택 거주 세대',
    benefit: '물막이판·역류방지시설·개폐형 방범창 설치비 지원',
    conditions: [
      { title: '현장점검이 완료된 주택', description: '전문가가 등록한 점검 결과가 있어야 해요.' },
      {
        title: '사업 기준 확인이 필요한 주택',
        description: '최종 대상 여부는 신청 후 담당자가 검토해요.',
      },
    ],
    requiredDocuments: [
      { title: '사업별 필요자료', description: '해당 사업 안내에 따라 준비해 주세요.' },
      { title: '추가 확인 서류', description: '필요한 경우 별도 안내' },
    ],
  },
];

export const mockSupportProgress: SupportProgress = {
  applicationId: '000002',
  programName: '침수 예방시설 설치 지원',
  decision: 'PENDING',
  consent: 'REQUIRED',
  submittedAt: '2026-10-07T10:00:00+09:00',
  facility: '출입구 물막이판',
  preferredDate: '2026-10-21',
  preferredTimeSlot: 'MORNING',
};

/**
 * 접수번호별로 지원 진행 상태를 바꿔서 04-5 ~ 04-10 을 모두 열어볼 수 있게 합니다.
 *   000002 검토 중(세입자) · 000003 승인 · 000004 미승인 · 000005 일정 조율 중 · 000006 검토 중(소유자)
 */
const mockSupportOverrides: Record<string, Partial<SupportProgress>> = {
  '000003': {
    decision: 'APPROVED',
    consent: 'CONFIRMED',
    scheduledAt: '2026-10-21T10:00:00+09:00',
  },
  '000004': {
    decision: 'REJECTED',
    consent: 'NOT_REQUIRED',
    rejectReason: '자격 미달',
    facility: '배수시설 개선',
  },
  '000005': { decision: 'APPROVED', consent: 'CONFIRMED' },
};

export const mockSupportProgressFor = (applicationId: string): SupportProgress => ({
  ...mockSupportProgress,
  applicationId,
  ...mockSupportOverrides[applicationId],
});

export const mockApplicationDetailFor = (id: string): ApplicationDetail => ({
  ...mockApplicationDetail,
  ...mockApplications.find((a) => a.id === id),
  id,
  request: { ...mockApplicationDetail.request, tenure: id === '000006' ? 'OWNER' : 'TENANT' },
});

export const mockConstructionFor = (applicationId: string): Construction => ({
  applicationId,
  status: 'SCHEDULED',
  facility: '출입구 물막이판',
  scheduledAt: '2026-10-21T10:00:00+09:00',
  contractor: 'OO시공',
  resultPhotoUrls: [],
  location: '출입구',
  ...(applicationId === '000007' && { status: 'IN_PROGRESS' as const }),
  ...(applicationId === '000008' && {
    status: 'COMPLETED' as const,
    completedAt: '2026-10-21T15:00:00+09:00',
    resultNote: '개폐 및 통행 확인 완료',
  }),
});

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

export const mockRiskContent = {
  HIGH: {
    label: '높음',
    color: 'text-danger',
    need: '점검 권장',
    title: '취약도가 높아요',
    message: '바로 현장점검을 신청해보세요!',
    factors: [
      '저지대 · 주변보다 낮은 지형',
      '배수 · 우수관로 용량 부족',
      '과거 침수 · 인근 신청 다수',
    ],
  },
  CAUTION: {
    label: '주의',
    color: 'text-warning',
    need: '점검 권장',
    title: '침수에 주의가 필요해요',
    message: '예방조치를 확인하고, 현장점검으로 우리 집 상태를 확인해 보세요.',
    factors: [
      '지형 · 일부 낮은 구간 확인',
      '배수 · 주변 배수 상태 확인 필요',
      '과거 침수 · 주변 이력 확인 필요',
    ],
  },
  LOW: {
    label: '낮음',
    color: 'text-success',
    need: '예방 가이드 먼저',
    title: '취약도가 낮아도 예방은 필요해요',
    message:
      '침수 위험이 전혀 없다는 뜻은 아니에요. 먼저 예방 가이드를 따라 해보고, 해결되지 않으면 현장점검을 신청할 수 있어요.',
    factors: [
      '지형 · 주변과 비슷한 높이',
      '배수 · 우수관로 용량 충분',
      '과거 침수 · 인근 신청 없음',
    ],
  },
} as const;
