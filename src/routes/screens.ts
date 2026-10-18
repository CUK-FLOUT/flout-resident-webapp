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
    figmaName: '온보딩',
    figmaNodes: ['1115:4758'],
    specs: [],
    next: ['login', 'signup'],
    status: 'done',
    group: '진입·인증',
  },
  login: {
    figmaName: '로그인 · 이메일 및 Google',
    figmaNodes: ['1116:1389'],
    specs: [],
    next: ['consent'],
    status: 'todo',
    group: '진입·인증',
  },
  signup: {
    figmaName: '회원가입 · 자체 계정',
    figmaNodes: ['1115:4798'],
    specs: [],
    next: ['consent'],
    status: 'todo',
    group: '진입·인증',
  },
  consent: {
    figmaName: '00 정보 제공 동의',
    figmaNodes: ['1115:2428'],
    specs: [],
    next: ['home'],
    status: 'todo',
    group: '진입·인증',
  },

  /* ── 홈·취약도 ── */
  home: {
    figmaName: '01 홈화면',
    figmaNodes: ['1115:2381'],
    specs: ['RISK-01'],
    next: ['riskResult', 'applications', 'notifications'],
    status: 'done',
    group: '홈·취약도',
  },
  riskResult: {
    figmaName: '02 취약도 결과 (높음·주의) / 01. 취약도 결과 - 낮음',
    figmaNodes: ['1115:2530', '1115:4451'],
    specs: ['RISK-02', 'RISK-03', 'RISK-04', 'RISK-05', 'RISK-06', 'RISK-08', 'RISK-09'],
    next: ['inspectionApply', 'guideLoading'],
    status: 'done',
    group: '홈·취약도',
  },

  /* ── 예방 가이드 (취약도 낮음 플로우) ── */
  guideLoading: {
    figmaName: '02. 예방 가이드 생성 중',
    figmaNodes: ['1115:4498'],
    specs: ['RISK-07'],
    next: ['guide'],
    status: 'todo',
    group: '예방 가이드',
  },
  guide: {
    figmaName: '03. 맞춤 예방 가이드 상세',
    figmaNodes: ['1115:4538'],
    specs: ['RISK-07'],
    sheets: [{ figmaName: '04. 해결 여부 확인 바텀시트', figmaNode: '1115:4592' }],
    next: ['guideResolved', 'guideUnresolved'],
    status: 'todo',
    group: '예방 가이드',
  },
  guideUnresolved: {
    figmaName: '05. 미해결 사유 선택',
    figmaNodes: ['1115:4670'],
    specs: ['RISK-09'],
    next: ['inspectionApply'],
    status: 'todo',
    group: '예방 가이드',
  },
  guideResolved: {
    figmaName: '06. 해결 완료',
    figmaNodes: ['1115:4716'],
    specs: [],
    next: ['home'],
    status: 'todo',
    group: '예방 가이드',
  },

  /* ── 현장점검 신청 ── */
  inspectionApply: {
    figmaName: '03 현장점검 신청 (1/3 주택 상황)',
    figmaNodes: ['1115:4333'],
    specs: ['INSPECTION-01', 'INSPECTION-02', 'INSPECTION-03', 'INSPECTION-04', 'INSPECTION-10'],
    next: ['inspectionSchedule'],
    status: 'todo',
    group: '현장점검 신청',
  },
  inspectionSchedule: {
    figmaName: '03-2 현장점검 신청 (날짜입력)',
    figmaNodes: ['1115:2571'],
    specs: ['INSPECTION-05'],
    next: ['inspectionConfirm'],
    status: 'todo',
    group: '현장점검 신청',
  },
  inspectionConfirm: {
    figmaName: '03-3 현장점검 신청 (신청 정보확인)',
    figmaNodes: ['1115:2623'],
    specs: ['INSPECTION-06', 'INSPECTION-07'],
    next: ['inspectionComplete'],
    status: 'todo',
    group: '현장점검 신청',
  },
  inspectionComplete: {
    figmaName: '04-1 접수 완료',
    figmaNodes: ['1115:2706'],
    specs: ['INSPECTION-08', 'NOTI-01'],
    next: ['inspectionNextSteps', 'applicationHub'],
    status: 'todo',
    group: '현장점검 신청',
  },
  inspectionNextSteps: {
    figmaName: '04-2 이후 진행 절차',
    figmaNodes: ['1115:2765'],
    specs: ['INSPECTION-09'],
    next: ['applications'],
    status: 'todo',
    group: '현장점검 신청',
  },

  /* ── 내 신청 ── */
  applications: {
    figmaName: '05 내 신청',
    figmaNodes: ['1115:2816'],
    specs: ['STATUS-01'],
    next: ['applicationHub', 'applicationsAll'],
    status: 'todo',
    group: '내 신청',
  },
  applicationsAll: {
    figmaName: '05-2 전체 신청 내역',
    figmaNodes: ['1115:2862'],
    specs: ['STATUS-01'],
    next: ['applicationHub'],
    status: 'todo',
    group: '내 신청',
  },
  applicationHub: {
    figmaName: '06-1 신청 상세 · 진행 허브',
    figmaNodes: ['1115:2936'],
    specs: ['STATUS-02', 'STATUS-05', 'STATUS-06'],
    next: ['applicationInfo', 'visit', 'result', 'supportStatus', 'construction'],
    status: 'todo',
    group: '내 신청',
  },
  applicationInfo: {
    figmaName: '06-2 신청 정보',
    figmaNodes: ['1115:2993'],
    specs: ['INSPECTION-06'],
    status: 'todo',
    group: '내 신청',
  },
  visit: {
    figmaName: '07-1 방문 일정',
    figmaNodes: ['1115:3024'],
    specs: ['STATUS-03', 'NOTI-02', 'NOTI-03'],
    next: ['visitPrepare'],
    status: 'todo',
    group: '내 신청',
  },
  visitPrepare: {
    figmaName: '07-2 방문 전 안내',
    figmaNodes: ['1115:3077'],
    specs: ['STATUS-04'],
    status: 'todo',
    group: '내 신청',
  },

  /* ── 점검 결과 ── */
  result: {
    figmaName: '08-1 현장점검 결과 · 요약',
    figmaNodes: ['1115:3111'],
    specs: ['RESULT-01', 'RESULT-02', 'NOTI-04'],
    next: ['resultPoints', 'resultRecommendations'],
    status: 'todo',
    group: '점검 결과',
  },
  resultPoints: {
    figmaName: '08-2 취약지점 상세 · 현장사진',
    figmaNodes: ['1115:3140'],
    specs: ['RESULT-03', 'RESULT-04'],
    next: ['resultRecommendations'],
    status: 'todo',
    group: '점검 결과',
  },
  resultRecommendations: {
    figmaName: '08-3 전문가 권장 예방조치',
    figmaNodes: ['1115:3194'],
    specs: ['RESULT-05', 'RESULT-06', 'RESULT-08'],
    next: ['support'],
    status: 'todo',
    group: '점검 결과',
  },

  /* ── 지원 ── */
  support: {
    figmaName: '09-1 지원 안내',
    figmaNodes: ['1115:3218'],
    specs: ['RESULT-07', 'SUPPORT-01'],
    next: ['supportRequirements'],
    status: 'todo',
    group: '지원',
  },
  supportRequirements: {
    figmaName: '09-2 지원 조건 · 준비서류',
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
    sheets: [{ figmaName: '10 Bottom Sheet 지원 신청', figmaNode: '1115:3305' }],
    next: ['supportComplete'],
    status: 'todo',
    group: '지원',
  },
  supportComplete: {
    figmaName: '11 지원 신청 완료',
    figmaNodes: ['1115:3486'],
    specs: ['SUPPORT-09', 'NOTI-05'],
    next: ['supportStatus'],
    status: 'todo',
    group: '지원',
  },
  supportStatus: {
    figmaName: '12-1 행정 검토 중 / 12-2 임대인 동의 필요 / 12-3 승인 / 12-4 미승인',
    figmaNodes: ['1115:3550', '1115:3605', '1115:3669', '1115:3722'],
    specs: ['CONSTRUCTION-01', 'CONSTRUCTION-02', 'CONSTRUCTION-03', 'NOTI-06'],
    next: ['construction'],
    status: 'todo',
    group: '지원',
  },

  /* ── 시공 ── */
  construction: {
    figmaName: '13 시공 일정',
    figmaNodes: ['1115:3773'],
    specs: ['CONSTRUCTION-04', 'NOTI-07'],
    sheets: [{ figmaName: '13-1 방문전 확인', figmaNode: '1115:3827' }],
    next: ['constructionProgress'],
    status: 'todo',
    group: '시공',
  },
  constructionProgress: {
    figmaName: '14 시공진행',
    figmaNodes: ['1115:3951'],
    specs: ['CONSTRUCTION-05'],
    next: ['constructionComplete'],
    status: 'todo',
    group: '시공',
  },
  constructionComplete: {
    figmaName: '15. 시공 완료',
    figmaNodes: ['1115:4034'],
    specs: ['CONSTRUCTION-06', 'CONSTRUCTION-07', 'NOTI-08'],
    next: ['home'],
    status: 'todo',
    group: '시공',
  },

  /* ── 알림 ── */
  notifications: {
    figmaName: '16 알림',
    figmaNodes: ['1115:4101'],
    specs: ['NOTI-01', 'NOTI-02', 'NOTI-03', 'NOTI-04', 'NOTI-05', 'NOTI-06', 'NOTI-07', 'NOTI-08'],
    sheets: [{ figmaName: '16-1 바텀시트 (알림 상세)', figmaNode: '1115:4183' }],
    status: 'todo',
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
