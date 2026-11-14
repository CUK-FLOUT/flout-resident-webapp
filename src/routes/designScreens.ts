import type { PathKey } from '@/constants/paths';

/** 주민용 최종디자인(1115:2380)의 최상위 화면·상태 프레임. 2026-11-02 확인.
 * route는 해당 화면 경로, relatedRoute는 상태를 직접 열 수 없는 관련 구현 위치다.
 * Figma의 중복 번호도 원문대로 유지한다. 참고용 프레임과 주석은 제외한다.
 */
export interface DesignScreen {
  nodeId: string;
  name: string;
  route?: PathKey;
  relatedRoute?: PathKey;
  status?: 'done' | 'wip' | 'todo';
  sampleApplicationId?: string;
  preview?:
    | 'risk-loading'
    | 'risk-high'
    | 'risk-caution'
    | 'risk-low'
    | 'risk-upper'
    | 'guide-loading'
    | 'guide-list'
    | 'guide-sheet'
    | 'guide-resolved';
}

export const DESIGN_SCREENS: DesignScreen[] = [
  {
    nodeId: '1115:2428',
    name: '00 정보 제공 동의',
    route: 'consent',
  },
  {
    nodeId: '1115:4758',
    name: '온보딩 · 로그인 방식 선택',
    route: 'onboarding',
  },
  {
    nodeId: '1116:1389',
    name: '로그인 · 이메일·Google',
    route: 'login',
  },
  {
    nodeId: '1115:4798',
    name: '회원가입 · 이메일 계정',
    route: 'signup',
  },
  {
    nodeId: '2167:2693',
    name: '01 홈화면',
    route: 'home',
  },
  {
    nodeId: '2755:2722',
    name: '01-1 홈화면 진행 중인 신청 없음',
    relatedRoute: 'home',
    status: 'done',
  },
  {
    nodeId: '3610:4208',
    name: '01-2 전체보기',
    route: 'homeProgress',
  },
  {
    nodeId: '3854:3043',
    name: '01-3 홈화면 · 로그아웃',
    relatedRoute: 'home',
    status: 'done',
  },
  {
    nodeId: '2020:1503',
    name: '01-1 주소 검색 · 검색 결과 선택',
    route: 'addressSearch',
  },
  {
    nodeId: '2108:1558',
    name: '01-3 부천시 외 주소 안내',
    relatedRoute: 'addressSearch',
    status: 'done',
  },
  {
    nodeId: '1787:1529',
    name: '01-4 주소 확인 · 상세 주소 입력',
    route: 'addressDetail',
  },
  {
    nodeId: '2764:2817',
    name: '02-0 취약도 분석 중',
    route: 'riskLoading',
    preview: 'risk-loading',
  },
  {
    nodeId: '1115:2530',
    name: '02-1 취약도 결과 · 높음',
    route: 'riskResult',
    preview: 'risk-high',
  },
  {
    nodeId: '1584:1865',
    name: '02-1 취약도 결과 · 보통',
    route: 'riskResult',
    preview: 'risk-caution',
  },
  {
    nodeId: '1115:4451',
    name: '02-2 취약도 결과 · 낮음',
    route: 'riskResult',
    preview: 'risk-low',
  },
  {
    nodeId: '1787:1610',
    name: '02-3 취약도결과 · 2층 이상',
    route: 'riskResult',
    preview: 'risk-upper',
  },
  {
    nodeId: '1115:4498',
    name: '02-4 맞춤 가이드 생성 중',
    route: 'guideLoading',
    preview: 'guide-loading',
  },
  {
    nodeId: '1115:4538',
    name: '02-5 맞춤 예방 가이드·체크리스트',
    route: 'guide',
    preview: 'guide-list',
  },
  {
    nodeId: '1115:4592',
    name: '02-6 해결 여부 확인 바텀시트',
    route: 'guide',
    preview: 'guide-sheet',
  },
  {
    nodeId: '1115:4716',
    name: '02-7 예방가이드 해결 완료',
    route: 'guideResolved',
    preview: 'guide-resolved',
  },
  {
    nodeId: '1115:4333',
    name: '03-1 현장점검하기_현장점검 신청',
    route: 'inspectionApply',
  },
  {
    nodeId: '1115:2571',
    name: '03-2 현장점검하기_현장점검 신청',
    route: 'inspectionSchedule',
  },
  {
    nodeId: '1115:2623',
    name: '03-3 현장점검하기_신청 정보 확인',
    route: 'inspectionConfirm',
  },
  {
    nodeId: '1115:2706',
    name: '03-4 현장점검하기_접수 완료',
    route: 'inspectionComplete',
  },
  {
    nodeId: '1115:2765',
    name: '03-5 현장점검하기_진행 절차',
    route: 'inspectionNextSteps',
  },
  {
    nodeId: '1115:2936',
    name: '03-6현장점검하기_접수이후',
    route: 'applicationHub',
  },
  {
    nodeId: '1115:2993',
    name: '03-7 현장점검하기_점검 신청 내역',
    route: 'applicationInfo',
  },
  {
    nodeId: '1115:3024',
    name: '03-8 현장점검하기_점검예정',
    route: 'visit',
  },
  {
    nodeId: '1115:3077',
    name: '03-9 현장점검하기_방문 전 안내',
    route: 'visitPrepare',
  },
  {
    nodeId: '1565:1446',
    name: '03-11 현장점검하기_결과등록',
    route: 'resultRegistered',
  },
  {
    nodeId: '2215:2458',
    name: '03-10 현장점검하기_점검진행',
    route: 'inspectionProgress',
  },
  {
    nodeId: '1115:3111',
    name: '03-12 현장점검하기_점검 결과 보기',
    route: 'result',
  },
  {
    nodeId: '1115:3140',
    name: '03-13 현장점검하기_취약점',
    route: 'resultPoints',
  },
  {
    nodeId: '1115:3194',
    name: '03-14 현장점검하기_권장 예방조치',
    route: 'resultRecommendations',
  },
  {
    nodeId: '4133:3051',
    name: '03-15 현장점검하기_권장 예방조치 · 시설 미추출',
    relatedRoute: 'resultRecommendations',
    status: 'done',
  },
  {
    nodeId: '1115:3218',
    name: '04-1 지원하기_지원사업',
    route: 'support',
  },
  {
    nodeId: '1115:3253',
    name: '04-2 지원하기_신청전확인',
    route: 'supportRequirements',
  },
  {
    nodeId: '1115:3305',
    name: '04-3 지원하기_신청하기',
    route: 'supportApply',
  },
  {
    nodeId: '1115:3605',
    name: '04-4 지원하기_지원동의_세입자',
    route: 'supportSubmit',
  },
  {
    nodeId: '2817:2745',
    name: '04-5 지원하기_지원동의_첨부 완료',
    relatedRoute: 'supportSubmit',
    status: 'done',
    sampleApplicationId: '000002',
  },
  {
    nodeId: '2409:5122',
    name: '04-6 지원하기_지원동의_소유자/기타',
    relatedRoute: 'supportSubmit',
    status: 'done',
    sampleApplicationId: '000006',
  },
  {
    nodeId: '1115:3486',
    name: '04-7 지원하기_접수완료',
    route: 'supportComplete',
  },
  {
    nodeId: '1115:3550',
    name: '04-8 지원하기_지원검토',
    route: 'supportStatus',
  },
  {
    nodeId: '1115:3669',
    name: '04-9 지원하기_승인',
    relatedRoute: 'supportStatus',
    status: 'done',
    sampleApplicationId: '000003',
  },
  {
    nodeId: '1115:3722',
    name: '04-10 지원 결과 · 미승인',
    relatedRoute: 'supportStatus',
    status: 'done',
    sampleApplicationId: '000004',
  },
  {
    nodeId: '2020:1642',
    name: '04-11 지원하기_일정 조율 중',
    relatedRoute: 'supportStatus',
    status: 'done',
    sampleApplicationId: '000005',
  },
  {
    nodeId: '1115:3773',
    name: '05-1 시공하기_시공예정',
    route: 'construction',
    sampleApplicationId: '000008',
  },
  {
    nodeId: '1115:3827',
    name: '05-2 시공하기_방문전 안내',
    relatedRoute: 'construction',
    status: 'done',
    sampleApplicationId: '000008',
  },
  {
    nodeId: '1115:3951',
    name: '05-3 시공하기_시공진행',
    route: 'constructionProgress',
    sampleApplicationId: '000009',
  },
  {
    nodeId: '1115:4034',
    name: '05-4 시공결과',
    route: 'constructionComplete',
    sampleApplicationId: '000010',
  },
  {
    nodeId: '1115:2862',
    name: '06-1 내 신청',
    route: 'applicationsAll',
  },
  {
    nodeId: '2232:2653',
    name: '06-2 내 신청 · 공통 상세보기',
    route: 'applicationDetail',
  },
  {
    nodeId: '1373:431',
    name: '06-3 내 신청_목록없음',
    relatedRoute: 'applicationsAll',
  },
  {
    nodeId: '1115:4101',
    name: '07-1 알림 목록',
    route: 'notifications',
  },
  {
    nodeId: '2255:2671',
    name: '07-2 알림 목록 · 알림 없음',
    relatedRoute: 'notifications',
  },
];
