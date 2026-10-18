import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/http';
import { env } from '@/lib/env';
import { mockDelay } from './mocks';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // 4xx는 재시도해도 같은 결과라 재시도하지 않음
      retry: (count, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
    },
  },
});

/**
 * VITE_USE_MOCK=true 이면 목업을, 아니면 실제 API를 호출합니다.
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
  application: (id: string) => ['applications', id] as const,
  result: (applicationId: string) => ['applications', applicationId, 'result'] as const,
  supportPrograms: (applicationId: string) =>
    ['applications', applicationId, 'support-programs'] as const,
  supportProgress: (applicationId: string) => ['applications', applicationId, 'support'] as const,
  construction: (applicationId: string) => ['applications', applicationId, 'construction'] as const,
  notifications: () => ['notifications'] as const,
};
