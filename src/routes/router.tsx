import type { ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import HomePage from '@/pages/home/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import RouteErrorPage from '@/pages/RouteErrorPage';

/**
 * 라우트 정의. 홈을 제외한 화면은 lazy import 로 코드 스플리팅합니다.
 * 새 화면 추가 순서: constants/paths.ts → routes/screens.ts → 여기 → pages/<도메인>/XxxPage.tsx
 */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // 진입·인증
      { path: PATHS.onboarding, lazy: page(() => import('@/pages/auth/OnboardingPage')) },
      { path: PATHS.login, lazy: page(() => import('@/pages/auth/LoginPage')) },
      { path: PATHS.signup, lazy: page(() => import('@/pages/auth/SignupPage')) },
      { path: PATHS.consent, lazy: page(() => import('@/pages/auth/ConsentPage')) },

      // 홈·취약도·예방 가이드
      { path: PATHS.home, element: <HomePage /> },
      { path: PATHS.riskResult, lazy: page(() => import('@/pages/risk/RiskResultPage')) },
      { path: PATHS.guideLoading, lazy: page(() => import('@/pages/guide/GuideLoadingPage')) },
      { path: PATHS.guide, lazy: page(() => import('@/pages/guide/GuidePage')) },
      {
        path: PATHS.guideUnresolved,
        lazy: page(() => import('@/pages/guide/GuideUnresolvedPage')),
      },
      { path: PATHS.guideResolved, lazy: page(() => import('@/pages/guide/GuideResolvedPage')) },

      // 현장점검 신청
      {
        path: PATHS.inspectionApply,
        lazy: page(() => import('@/pages/inspection/InspectionApplyPage')),
      },
      {
        path: PATHS.inspectionSchedule,
        lazy: page(() => import('@/pages/inspection/InspectionSchedulePage')),
      },
      {
        path: PATHS.inspectionConfirm,
        lazy: page(() => import('@/pages/inspection/InspectionConfirmPage')),
      },
      {
        path: PATHS.inspectionComplete,
        lazy: page(() => import('@/pages/inspection/InspectionCompletePage')),
      },
      {
        path: PATHS.inspectionNextSteps,
        lazy: page(() => import('@/pages/inspection/InspectionNextStepsPage')),
      },

      // 내 신청 · 진행상태
      {
        path: PATHS.applications,
        lazy: page(() => import('@/pages/applications/ApplicationsPage')),
      },
      {
        path: PATHS.applicationsAll,
        lazy: page(() => import('@/pages/applications/ApplicationsAllPage')),
      },
      {
        path: PATHS.applicationHub,
        lazy: page(() => import('@/pages/applications/ApplicationHubPage')),
      },
      {
        path: PATHS.applicationInfo,
        lazy: page(() => import('@/pages/applications/ApplicationInfoPage')),
      },
      { path: PATHS.visit, lazy: page(() => import('@/pages/applications/VisitPage')) },
      {
        path: PATHS.visitPrepare,
        lazy: page(() => import('@/pages/applications/VisitPreparePage')),
      },

      // 점검 결과
      { path: PATHS.result, lazy: page(() => import('@/pages/result/ResultSummaryPage')) },
      { path: PATHS.resultPoints, lazy: page(() => import('@/pages/result/ResultPointsPage')) },
      {
        path: PATHS.resultRecommendations,
        lazy: page(() => import('@/pages/result/ResultRecommendationsPage')),
      },

      // 지원
      { path: PATHS.support, lazy: page(() => import('@/pages/support/SupportPage')) },
      {
        path: PATHS.supportRequirements,
        lazy: page(() => import('@/pages/support/SupportRequirementsPage')),
      },
      { path: PATHS.supportApply, lazy: page(() => import('@/pages/support/SupportApplyPage')) },
      {
        path: PATHS.supportComplete,
        lazy: page(() => import('@/pages/support/SupportCompletePage')),
      },
      { path: PATHS.supportStatus, lazy: page(() => import('@/pages/support/SupportStatusPage')) },
      {
        path: PATHS.supportConsent,
        lazy: page(() => import('@/pages/support/SupportStatusPage')),
      },

      // 시공
      {
        path: PATHS.construction,
        lazy: page(() => import('@/pages/construction/ConstructionSchedulePage')),
      },
      {
        path: PATHS.constructionProgress,
        lazy: page(() => import('@/pages/construction/ConstructionProgressPage')),
      },
      {
        path: PATHS.constructionComplete,
        lazy: page(() => import('@/pages/construction/ConstructionCompletePage')),
      },

      // 알림
      {
        path: PATHS.notifications,
        lazy: page(() => import('@/pages/notifications/NotificationsPage')),
      },

      // 개발용 화면 목록
      ...(env.isDev
        ? [{ path: PATHS.devScreens, lazy: page(() => import('@/pages/dev/DevScreensPage')) }]
        : []),

      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
