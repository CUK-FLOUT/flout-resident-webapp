import { QueryClient } from '@tanstack/react-query';
import { ApiError, RefreshError } from '@/lib/http';
import { env } from '@/lib/env';
import { mockDelay } from './mocks';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        !(error instanceof RefreshError) &&
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        count < 2,
    },
  },
});

/**
 * 개발 환경에서 VITE_USE_MOCK=true 이면 목업을, 아니면 실제 API를 호출합니다.
 * @example withMock(() => mockResult, () => http.get('/...'))
 */
export function withMock<T>(mock: () => T, real: () => Promise<T>): Promise<T> {
  return env.useMock ? mockDelay().then(mock) : real();
}

/** 쿼리 키는 여기서만 정의합니다. invalidate 할 때 오타 방지. */
export const queryKeys = {
  address: (keyword: string) => ['address', keyword] as const,
  assessment: (id: string) => ['assessment', id] as const,
  guide: (assessmentId: string) => ['guide', assessmentId] as const,
  applications: () => ['applications'] as const,
  residentProgress: (session: string | null) => ['resident-progress', session] as const,
  supportConsentTarget: (session: string | null, applicationId: number, supportId: number) =>
    ['support-consent-target', session, applicationId, supportId] as const,
  application: (id: string) => ['applications', id] as const,
  result: (applicationId: string) => ['applications', applicationId, 'result'] as const,
  supportPrograms: (applicationId: string) =>
    ['applications', applicationId, 'support-programs'] as const,
  inspectionApplication: (applicationId: string) =>
    ['applications', applicationId, 'inspection-application'] as const,
  recommendedFacilities: (applicationId: string) =>
    ['applications', applicationId, 'recommended-facilities'] as const,
  supportProgress: (applicationId: string) => ['applications', applicationId, 'support'] as const,
  supportReview: (supportApplicationId: number) =>
    ['support-applications', supportApplicationId, 'review'] as const,
  supportDetail: (supportApplicationId: number, detail: string) =>
    ['support-applications', supportApplicationId, detail] as const,
  constructionDetail: (constructionId: number, detail: string) =>
    ['constructions', constructionId, detail] as const,
  notifications: () => ['notifications'] as const,
  unreadNotifications: () => ['notifications', 'unread'] as const,
};
