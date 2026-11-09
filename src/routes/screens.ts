import type { PathKey } from '@/constants/paths';

/**
 * 화면 매니페스트 — Figma 주민용 최종디자인(1115:2380) 프레임 ↔ 라우트 ↔ 기능명세 ID.
 * 개발용 화면 목록(/__screens)과 미구현 화면 placeholder 가 이 데이터를 사용합니다.
 * 화면을 구현하면 status 를 'done' 으로 바꿔 주세요.
 */
export interface ScreenMeta {
  /** Figma 프레임 이름 */
  figmaName: string;
  /** Figma node id (여러 상태 프레임이면 배열) */
  figmaNodes: string[];
  /** 노션 기능명세서 ID */
  specs: string[];
  /** 이 화면 위에 뜨는 바텀시트 (라우트 아님) */
  sheets?: { figmaName: string; figmaNode: string }[];
  /** 다음으로 이동하는 화면 (placeholder 에서 플로우 이동 버튼으로 노출) */
  next?: PathKey[];
  status: 'todo' | 'wip' | 'done';
  group:
    | '진입·인증'
    | '홈·취약도'
    | '예방 가이드'
    | '현장점검 신청'
    | '내 신청'
    | '점검 결과'
    | '지원'
    | '시공'
    | '알림';
}

export const FIGMA_FILE_URL = 'https://www.figma.com/design/vGHXBD128aui75dvqLXEbP/FLOUT';
export const figmaNodeUrl = (nodeId: string) =>
  `${FIGMA_FILE_URL}?node-id=${nodeId.replace(':', '-')}`;

export const SCREENS: Partial<Record<PathKey, ScreenMeta>> = {
  /* ── 진입·인증 ── */
  onboarding: {
    figmaName: '온보딩 · 로그인 방식 선택',
    figmaNodes: ['1115:4758'],
    specs: [],
    next: ['login', 'signup'],
    status: 'done',
    group: '진입·인증',
  },
  login: {
    figmaName: '로그인 · 이메일·Google',
    figmaNodes: ['1116:1389'],
    specs: [],
    next: ['consent', 'home'],
    status: 'done',
    group: '진입·인증',
  },
  signup: {
    figmaName: '회원가입 · 이메일 계정',
    figmaNodes: ['1115:4798'],
    specs: [],
    next: ['login'],
    status: 'done',
    group: '진입·인증',
  },
  consent: {
    figmaName: '00 정보 제공 동의',
    figmaNodes: ['1115:2428'],
    specs: [],
    next: ['home'],
    status: 'done',
    group: '진입·인증',
  },

  /* ── 홈·취약도 ── */
  home: {
    figmaName: '01 홈화면',
    figmaNodes: ['2167:2693', '2755:2722'],
    specs: ['RISK-01'],
    next: ['addressSearch', 'inspectionApply', 'applications', 'notifications'],
    status: 'done',
    group: '홈·취약도',
  },
  addressSearch: {
    figmaName: '01-1 주소 검색 · 검색 결과 선택',
    figmaNodes: ['2020:1503'],
    specs: ['RISK-01'],
    next: ['addressDetail'],
    status: 'done',
    group: '홈·취약도',
  },
  addressDetail: {
    figmaName: '01-4 주소 확인 · 상세 주소 입력',
    figmaNodes: ['1787:1529'],
    specs: ['RISK-01'],
    next: ['riskLoading'],
    status: 'done',
    group: '홈·취약도',
  },
  riskLoading: {
    figmaName: '02-0 취약도 분석 중',
    figmaNodes: ['2764:2817'],
    specs: ['RISK-02', 'RISK-03'],
    next: ['riskResult'],
    status: 'done',
    group: '홈·취약도',
  },
  riskResult: {
    figmaName: '02-1 취약도 결과 · 높음',
    figmaNodes: ['1115:2530', '1584:1865', '1115:4451', '1787:1610'],
    specs: ['RISK-02', 'RISK-03', 'RISK-04', 'RISK-05', 'RISK-06', 'RISK-08', 'RISK-09'],
    next: ['guideLoading', 'inspectionApply'],
    status: 'done',
    group: '홈·취약도',
  },

  /* ── 예방 가이드 (취약도 낮음 플로우) ── */
  guideLoading: {
    figmaName: '02-4 맞춤 가이드 생성 중',
    figmaNodes: ['1115:4498'],
    specs: ['RISK-07'],
    next: ['guide'],
    status: 'done',
    group: '예방 가이드',
  },
  guide: {
    figmaName: '02-5 맞춤 예방 가이드·체크리스트',
    figmaNodes: ['1115:4538'],
    specs: ['RISK-07'],
    sheets: [{ figmaName: '02-6 해결 여부 확인 바텀시트', figmaNode: '1115:4592' }],
    next: ['guideResolved'],
    status: 'done',
    group: '예방 가이드',
  },
  guideUnresolved: {
    figmaName: '이전 화면 · 미해결 사유 선택 (현재 디자인 없음)',
    figmaNodes: [],
    specs: ['RISK-09'],
    next: ['inspectionApply'],
    status: 'todo',
    group: '예방 가이드',
  },
  guideResolved: {
    figmaName: '02-7 예방가이드 해결 완료',
    figmaNodes: ['1115:4716'],
    specs: [],
    next: ['home'],
    status: 'done',
    group: '예방 가이드',
  },

  /* ── 현장점검 신청 ── */
  inspectionApply: {
    figmaName: '03-1 현장점검하기_현장점검 신청',
    figmaNodes: ['1115:4333'],
    specs: ['INSPECTION-01', 'INSPECTION-02', 'INSPECTION-03', 'INSPECTION-04', 'INSPECTION-10'],
    next: ['inspectionSchedule'],
    status: 'done',
    group: '현장점검 신청',
  },
  inspectionSchedule: {
    figmaName: '03-2 현장점검하기_현장점검 신청',
    figmaNodes: ['1115:2571'],
    specs: ['INSPECTION-05'],
    next: ['inspectionConfirm'],
    status: 'done',
    group: '현장점검 신청',
  },
  inspectionConfirm: {
    figmaName: '03-3 현장점검하기_신청 정보 확인',
    figmaNodes: ['1115:2623'],
    specs: ['INSPECTION-06', 'INSPECTION-07'],
    next: ['inspectionComplete'],
    status: 'done',
    group: '현장점검 신청',
  },
  inspectionComplete: {
    figmaName: '03-4 현장점검하기_접수 완료',
    figmaNodes: ['1115:2706'],
    specs: ['INSPECTION-08', 'NOTI-01'],
    next: ['home', 'inspectionNextSteps'],
    status: 'done',
    group: '현장점검 신청',
  },
  inspectionNextSteps: {
    figmaName: '03-5 현장점검하기_진행 절차',
    figmaNodes: ['1115:2765'],
    specs: ['INSPECTION-09'],
    next: ['home'],
    status: 'done',
    group: '현장점검 신청',
  },

  /* ── 내 신청 ── */
  applications: {
    figmaName: '이전 화면 · 내 신청 (현재 디자인 없음)',
    figmaNodes: [],
    specs: ['STATUS-01'],
    next: ['applicationHub', 'applicationsAll'],
    status: 'todo',
    group: '내 신청',
  },
  applicationsAll: {
    figmaName: '06-1 내 신청',
    figmaNodes: ['1115:2862', '1373:431'],
    specs: ['STATUS-01'],
    next: ['applicationDetail'],
    status: 'done',
    group: '내 신청',
  },
  applicationDetail: {
    figmaName: '06-2 내 신청 · 공통 상세보기',
    figmaNodes: ['2232:2653'],
    specs: ['STATUS-02'],
    status: 'done',
    group: '내 신청',
  },
  applicationHub: {
    figmaName: '03-6현장점검하기_접수이후',
    figmaNodes: ['1115:2936'],
    specs: ['STATUS-02', 'STATUS-05', 'STATUS-06'],
    next: ['applicationInfo', 'visit', 'result', 'supportStatus', 'construction'],
    status: 'done',
    group: '내 신청',
  },
  applicationInfo: {
    figmaName: '03-7 현장점검하기_점검 신청 내역',
    figmaNodes: ['1115:2993'],
    specs: ['INSPECTION-06'],
    status: 'done',
    group: '내 신청',
  },
  visit: {
    figmaName: '03-8 현장점검하기_점검예정',
    figmaNodes: ['1115:3024'],
    specs: ['STATUS-03', 'NOTI-02', 'NOTI-03'],
    next: ['visitPrepare'],
    status: 'done',
    group: '내 신청',
  },
  visitPrepare: {
    figmaName: '03-9 현장점검하기_방문 전 안내',
    figmaNodes: ['1115:3077'],
    specs: ['STATUS-04'],
    status: 'done',
    group: '내 신청',
  },

  inspectionProgress: {
    figmaName: '03-10 현장점검하기_점검진행',
    figmaNodes: ['2215:2458'],
    specs: ['HOME-01', 'INSPECTION-06'],
    status: 'done',
    group: '내 신청',
  },

  /* ── 점검 결과 ── */
  resultRegistered: {
    figmaName: '03-11 현장점검하기_결과등록',
    figmaNodes: ['1565:1446'],
    specs: [],
    next: ['result', 'applicationInfo'],
    status: 'done',
    group: '점검 결과',
  },
  result: {
    figmaName: '03-12 현장점검하기_점검 결과 보기',
    figmaNodes: ['1115:3111'],
    specs: ['RESULT-01', 'RESULT-02', 'NOTI-04'],
    next: ['resultPoints'],
    status: 'done',
    group: '점검 결과',
  },
  resultPoints: {
    figmaName: '03-13 현장점검하기_취약점',
    figmaNodes: ['1115:3140'],
    specs: ['RESULT-03', 'RESULT-04'],
    next: ['resultRecommendations'],
    status: 'done',
    group: '점검 결과',
  },
  resultRecommendations: {
    figmaName: '03-14 현장점검하기_권장 예방조치',
    figmaNodes: ['1115:3194'],
    specs: ['RESULT-05', 'RESULT-06', 'RESULT-08'],
    next: ['support', 'home'],
    status: 'done',
    group: '점검 결과',
  },

  /* ── 지원 ── */
  support: {
    figmaName: '04-1 지원하기_지원사업',
    figmaNodes: ['1115:3218'],
    specs: ['RESULT-07', 'SUPPORT-01'],
    next: ['supportRequirements'],
    status: 'done',
    group: '지원',
  },
  supportRequirements: {
    figmaName: '04-2 지원하기_신청전확인',
    figmaNodes: ['1115:3253'],
    specs: [
      'SUPPORT-02',
      'SUPPORT-03',
      'SUPPORT-04',
      'SUPPORT-05',
      'SUPPORT-06',
      'SUPPORT-07',
      'SUPPORT-08',
    ],
    next: ['supportApply'],
    status: 'done',
    group: '지원',
  },
  supportApply: {
    figmaName: '04-3 지원하기_신청하기',
    figmaNodes: ['1115:3305'],
    specs: [],
    next: ['supportSubmit'],
    status: 'done',
    group: '지원',
  },
  supportSubmit: {
    figmaName: '04-4 지원하기_지원동의_세입자',
    figmaNodes: ['1115:3605', '2817:2745', '2409:5122'],
    specs: ['SUPPORT-07'],
    next: ['supportComplete'],
    status: 'done',
    group: '지원',
  },
  supportComplete: {
    figmaName: '04-7 지원하기_접수완료',
    figmaNodes: ['1115:3486'],
    specs: ['SUPPORT-09', 'NOTI-05'],
    next: ['supportStatus'],
    status: 'done',
    group: '지원',
  },
  supportStatus: {
    figmaName: '04-8 지원하기_지원검토',
    figmaNodes: ['1115:3550', '1115:3669', '1115:3722', '2020:1642'],
    specs: ['CONSTRUCTION-01', 'CONSTRUCTION-02', 'NOTI-06'],
    next: ['construction'],
    status: 'done',
    group: '지원',
  },

  /* ── 시공 ── */
  construction: {
    figmaName: '05-1 시공하기_시공예정',
    figmaNodes: ['1115:3773', '1115:3827'],
    specs: ['CONSTRUCTION-04', 'NOTI-07'],
    next: ['constructionProgress'],
    status: 'done',
    group: '시공',
  },
  constructionProgress: {
    figmaName: '05-3 시공하기_시공진행',
    figmaNodes: ['1115:3951'],
    specs: ['CONSTRUCTION-05'],
    next: ['constructionComplete'],
    status: 'done',
    group: '시공',
  },
  constructionComplete: {
    figmaName: '05-4 시공결과',
    figmaNodes: ['1115:4034'],
    specs: ['CONSTRUCTION-06', 'CONSTRUCTION-07', 'NOTI-08'],
    next: ['home'],
    status: 'done',
    group: '시공',
  },

  /* ── 알림 ── */
  notifications: {
    figmaName: '07-1 알림 목록',
    figmaNodes: ['1115:4101', '2255:2671'],
    specs: ['NOTI-01', 'NOTI-02', 'NOTI-03', 'NOTI-04', 'NOTI-05', 'NOTI-06', 'NOTI-07', 'NOTI-08'],
    status: 'done',
    group: '알림',
  },
};

/** dev 화면 목록/placeholder 에서 동적 파라미터를 채울 샘플 값 (목업 데이터와 일치) */
export const SAMPLE_PARAMS = { assessmentId: 'ra-001', applicationId: '000001' } as const;

/** 패턴의 :param 을 샘플 값으로 채운 실제 URL (dev 전용) */
export function samplePath(pattern: string): string {
  return pattern.replace(/:(\w+)/g, (_, key: string) =>
    key in SAMPLE_PARAMS ? SAMPLE_PARAMS[key as keyof typeof SAMPLE_PARAMS] : key,
  );
}
