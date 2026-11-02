/**
 * 라우트 경로 패턴. 이동할 때는 문자열을 직접 쓰지 말고
 *   navigate(generatePath(PATHS.applicationHub, { applicationId }))
 * 처럼 generatePath 와 함께 쓰세요. (파라미터 이름이 타입 체크됩니다)
 */
export const PATHS = {
  // 진입 · 인증
  onboarding: '/onboarding',
  login: '/login',
  signup: '/signup',
  consent: '/consent',

  // 홈 · 취약도 (RISK)
  home: '/',
  riskResult: '/risk/:assessmentId',
  guideLoading: '/risk/:assessmentId/guide/loading',
  guide: '/risk/:assessmentId/guide',
  guideUnresolved: '/risk/:assessmentId/guide/unresolved',
  guideResolved: '/risk/:assessmentId/guide/resolved',

  // 현장점검 신청 (INSPECTION)
  inspectionApply: '/inspection/apply',
  inspectionSchedule: '/inspection/apply/schedule',
  inspectionConfirm: '/inspection/apply/confirm',
  inspectionComplete: '/inspection/complete/:applicationId',
  inspectionNextSteps: '/inspection/complete/:applicationId/next',

  // 내 신청 · 진행상태 (STATUS)
  applications: '/applications',
  applicationsAll: '/applications/all',
  applicationHub: '/applications/:applicationId',
  applicationInfo: '/applications/:applicationId/info',
  visit: '/applications/:applicationId/visit',
  visitPrepare: '/applications/:applicationId/visit/prepare',

  // 점검 결과 · 맞춤 예방안 (RESULT)
  result: '/applications/:applicationId/result',
  resultPoints: '/applications/:applicationId/result/points',
  resultRecommendations: '/applications/:applicationId/result/recommendations',

  // 지원 (SUPPORT)
  support: '/applications/:applicationId/support',
  supportRequirements: '/applications/:applicationId/support/requirements',
  supportApply: '/applications/:applicationId/support/apply',
  supportComplete: '/applications/:applicationId/support/complete',
  supportStatus: '/applications/:applicationId/support/status',
  supportConsent: '/applications/:applicationId/support/consent',

  // 시공 (CONSTRUCTION)
  construction: '/applications/:applicationId/construction',
  constructionProgress: '/applications/:applicationId/construction/progress',
  constructionComplete: '/applications/:applicationId/construction/complete',

  // 알림 (NOTI)
  notifications: '/notifications',

  // 개발용 화면 목록 (dev 빌드에서만 노출)
  devScreens: '/__screens',
} as const;

export type PathKey = keyof typeof PATHS;
