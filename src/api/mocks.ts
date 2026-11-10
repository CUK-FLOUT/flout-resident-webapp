import type {
  ApplicationStage,
  AddressCandidate,
  AppNotification,
  ApplicationDetail,
  ApplicationSummary,
  ConstructionResult,
  ConstructionStatus,
  InspectionApplicationDetail,
  InspectionResult,
  PreventionGuide,
  RecommendedFacilities,
  RiskAssessment,
  SupportApplicationResponse,
  SupportApplicationStatus,
  SupportApproval,
  SupportAttachmentResponse,
  SupportProgram,
  SupportProgress,
  SupportRejection,
  SupportReview,
  SupportSchedule,
} from '@/types/domain';

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
    title: '지원 · 침수 예방시설 설치 지원',
    address: '부천시 OO구 OO길 12',
    stage: 'SUPPORT_REVIEW',
    createdAt: '2026-10-07T10:00:00+09:00',
    updatedAt: '2026-10-07T10:00:00+09:00',
  },
  {
    id: '000004',
    title: '지원 · 침수 예방시설 설치 지원',
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

export const fixedSupportPrograms: SupportProgram[] = [
  {
    id: '1',
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

const MOCK_OWNER_APPLICATION_ID = 6;
const MOCK_CONSTRUCTION_STATUS: Record<number, ConstructionStatus> = {
  8: 'SCHEDULED',
  9: 'IN_PROGRESS',
  10: 'COMPLETED',
};
const MOCK_CONSTRUCTION_STAGE: Record<ConstructionStatus, ApplicationStage> = {
  PENDING: 'SUPPORT_APPROVED',
  SCHEDULED: 'CONSTRUCTION_SCHEDULED',
  IN_PROGRESS: 'CONSTRUCTION_IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};
const MOCK_SUPPORT_STATUS: Record<number, SupportApplicationStatus> = {
  2: 'SUBMITTED',
  3: 'APPROVED',
  4: 'REJECTED',
  5: 'APPROVED',
  6: 'SUBMITTED',
  8: 'APPROVED',
  9: 'APPROVED',
  10: 'APPROVED',
};

export const mockInspectionApplicationFor = (id: string): InspectionApplicationDetail => {
  const applicationId = Number(id);
  const status = MOCK_SUPPORT_STATUS[applicationId];
  const constructionStatus = MOCK_CONSTRUCTION_STATUS[applicationId];
  const detail = mockApplicationDetailFor(String(applicationId).padStart(6, '0'));
  const { request, stage, createdAt, hasResult } = detail;
  const inspectionStatus =
    stage === 'INSPECTION_RECEIVED'
      ? 'RECEIVED'
      : stage === 'VISIT_SCHEDULED'
        ? 'SCHEDULED'
        : stage === 'INSPECTION_IN_PROGRESS'
          ? 'IN_PROGRESS'
          : 'COMPLETED';
  return {
    applicationId,
    receiptNumber: detail.id,
    applicant: { name: request.applicantName, phone: '010-****-0002' },
    address: request.address,
    detailAddress: null,
    occupancyType: applicationId === MOCK_OWNER_APPLICATION_ID ? 'OWNER' : 'TENANT',
    floodExperience: request.floodExperience,
    inflowLocations: request.waterEntryPoints.map((location) =>
      location === 'OTHER' ? 'ETC' : location,
    ),
    existingFacility: request.existingFacility !== 'NONE',
    requestReason: request.reason ?? null,
    preferredVisitDate: request.preferredDate,
    preferredTimeSlot: request.preferredTimeSlot === 'ANYTIME' ? 'ANY' : request.preferredTimeSlot,
    attachmentCount: request.photoUrls.length,
    applicationStatus: inspectionStatus === 'COMPLETED' ? 'INSPECTION_COMPLETED' : 'RECEIVED',
    inspectionStatus,
    resultPublished: hasResult,
    createdAt,
    submittedAt: null,
    progress: {
      title: detail.title,
      stage: constructionStatus ? MOCK_CONSTRUCTION_STAGE[constructionStatus] : stage,
      constructionId: constructionStatus ? applicationId : null,
      inspectionResultSummary:
        inspectionStatus === 'COMPLETED'
          ? '출입구가 낮아 빗물 유입에 대비한 조치가 필요합니다.'
          : null,
      visit: null,
      support: status
        ? {
            supportApplicationId: applicationId,
            status,
            requestedFacility: '출입구 물막이판',
            supportScope: status === 'APPROVED' ? '출입구 물막이판 설치 지원' : null,
            rejectionReason: status === 'REJECTED' ? '자격 미달' : null,
          }
        : null,
      construction: constructionStatus
        ? {
            constructionId: applicationId,
            status: constructionStatus,
            scheduledAt: '2026-11-12T10:00:00+09:00',
            completedAt: constructionStatus === 'COMPLETED' ? '2026-11-12T15:00:00+09:00' : null,
            finalInstallationResult: constructionStatus === 'COMPLETED' ? '설치 완료' : null,
          }
        : null,
    },
  };
};

const MOCK_NO_FACILITY_APPLICATION_ID = 7;

export const mockRecommendedFacilitiesFor = (id: string): RecommendedFacilities => {
  const facilities =
    Number(id) === MOCK_NO_FACILITY_APPLICATION_ID
      ? []
      : Number(id) === MOCK_OWNER_APPLICATION_ID
        ? ['출입구 물막이판']
        : ['출입구 물막이판', '창문 차수판'];
  return { applicationId: Number(id), recommendationCount: facilities.length, facilities };
};

export const mockSupportApplicationFor = (
  applicationId: number,
  programId: number,
): SupportApplicationResponse => {
  const isOwner = applicationId === MOCK_OWNER_APPLICATION_ID;
  return {
    supportApplicationId: applicationId,
    applicationId,
    programId,
    status: isOwner ? 'SUBMITTED' : 'DRAFT',
    submittedAt: isOwner ? '2026-10-07T10:00:00+09:00' : null,
    receiptNumber: String(applicationId).padStart(6, '0'),
    applicantName: mockApplicationDetail.request.applicantName,
    programName: fixedSupportPrograms[0].name,
    createdAt: '2026-10-07T10:00:00+09:00',
  };
};

export const mockSupportAttachmentFor = (
  supportApplicationId: number,
  file: File,
): SupportAttachmentResponse => ({
  attachmentId: 1,
  supportApplicationId,
  attachmentType: 'LANDLORD_CONSENT',
  fileName: file.name,
  size: file.size,
  contentType: file.type,
  submittedAt: '2026-10-07T10:00:00+09:00',
  status: 'SUBMITTED',
});

export const mockSupportReviewFor = (supportApplicationId: number): SupportReview => {
  const isOwner = supportApplicationId === MOCK_OWNER_APPLICATION_ID;
  return {
    supportApplicationId,
    applicationId: supportApplicationId,
    receiptNo: String(supportApplicationId).padStart(6, '0'),
    applicantName: mockApplicationDetail.request.applicantName,
    address: mockApplicationDetail.request.address,
    detailAddress: null,
    programName: fixedSupportPrograms[0].name,
    status: 'SUBMITTED',
    submittedAt: '2026-10-07T10:00:00+09:00',
    requestedFacility: '출입구 물막이판',
    occupancyType: isOwner ? 'OWNER' : 'TENANT',
    preferredConstructionDate: '2026-10-21',
    preferredTimeSlot: 'MORNING',
  };
};

const mockSupportDecisionBase = (supportApplicationId: number) => ({
  supportApplicationId,
  applicationId: supportApplicationId,
  receiptNo: String(supportApplicationId).padStart(6, '0'),
  applicantName: mockApplicationDetail.request.applicantName,
  address: mockApplicationDetail.request.address,
  detailAddress: null,
  programName: fixedSupportPrograms[0].name,
  requestedFacility: '출입구 물막이판',
});

export const mockSupportApprovalFor = (id: number): SupportApproval => ({
  ...mockSupportDecisionBase(id),
  status: 'APPROVED',
  approvedAt: '2026-10-14T10:00:00+09:00',
  supportScope: '출입구 물막이판',
  scheduledConstructionDate: null,
  scheduledConstructionTime: null,
});

export const mockSupportRejectionFor = (id: number): SupportRejection => ({
  ...mockSupportDecisionBase(id),
  status: 'REJECTED',
  rejectionReason: '자격 미달',
  rejectedAt: '2026-10-14T10:00:00+09:00',
  inspectionId: id,
  inspectionResultPublished: true,
});

export const mockSupportScheduleFor = (id: number): SupportSchedule => ({
  ...mockSupportDecisionBase(id),
  status: 'APPROVED',
  scheduledConstructionDate: null,
  scheduledConstructionTime: null,
});

export const mockConstructionResultFor = (constructionId: number): ConstructionResult => {
  const status = MOCK_CONSTRUCTION_STATUS[constructionId] ?? 'SCHEDULED';
  const completed = status === 'COMPLETED';
  return {
    constructionId,
    supportApplicationId: constructionId,
    applicationId: constructionId,
    receiptNo: String(constructionId).padStart(6, '0'),
    applicantName: mockApplicationDetail.request.applicantName,
    address: mockApplicationDetail.request.address,
    detailAddress: null,
    status,
    requestedFacility: '출입구 물막이판',
    supportScope: '출입구 물막이판 설치',
    scheduledConstructionDate: '2026-10-21',
    scheduledConstructionTime: '10:00:00',
    completedAt: completed ? '2026-10-21T11:30:00+09:00' : null,
    finalInstallationResult: completed ? '출입구 물막이판 설치 · 개폐 및 통행 확인 완료' : null,
    updatedAt: '2026-10-21T10:00:00+09:00',
    workHistory: [{ status, changedAt: '2026-10-21T10:00:00+09:00' }],
    beforePhotos: [],
    photos: [],
  };
};

const today = new Date().toLocaleDateString('sv-SE');

export const mockNotifications: AppNotification[] = [
  {
    id: 'n-5',
    type: 'CONSTRUCTION_COMPLETED',
    applicationId: '000008',
    receiptNumber: '000008',
    title: '예방시설 설치가 완료됐어요.',
    body: '최종 설치 사진과 시공 결과가 등록됐어요.',
    createdAt: `${today}T11:42:00+09:00`,
    read: false,
  },
  {
    id: 'n-4',
    type: 'CONSTRUCTION_SCHEDULED',
    applicationId: '000003',
    receiptNumber: '000003',
    title: '오늘 오전 10시에 시공이 예정되어 있어요.',
    body: '방문 시간과 현장 출입 가능 여부를 확인해 주세요.',
    createdAt: `${today}T08:00:00+09:00`,
    read: false,
  },
  {
    id: 'n-3',
    type: 'SUPPORT_APPROVED',
    applicationId: '000003',
    receiptNumber: '000003',
    title: '지원 신청이 승인됐어요.',
    body: '시공 일정이 등록되면 알림으로 다시 안내해 드려요.',
    createdAt: '2026-10-17T14:20:00+09:00',
    read: true,
  },
  {
    id: 'n-2',
    type: 'SUPPORT_RECEIVED',
    applicationId: '000002',
    receiptNumber: '000002',
    title: '제출한 신청서 검토가 시작됐어요.',
    body: '지원 조건과 제출 서류를 담당자가 확인하고 있어요.',
    createdAt: '2026-10-08T09:16:00+09:00',
    read: true,
  },
  {
    id: 'n-1',
    type: 'INSPECTION_RESULT_PUBLISHED',
    applicationId: '000005',
    receiptNumber: '000005',
    title: '현장점검 결과가 등록됐어요.',
    body: '취약지점과 전문가 권장 예방조치를 확인할 수 있어요.',
    createdAt: '2026-10-03T16:05:00+09:00',
    read: true,
  },
];
