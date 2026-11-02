import { useQuery } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { ApiError, http } from '@/lib/http';
import { serviceAccessMock } from '@/api/serviceAccessMock';
import { queryKeys } from '@/api/queryClient';

export type Service = 'inspection' | 'support' | 'construction';

interface ApplicationResponse {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result?: { inspectionStatus?: string | null; resultPublished?: boolean };
}

export function useServiceAccess(service: Service, applicationId?: string) {
  const useMock = env.isDev && env.useMock;
  const canCheck = service === 'support' && Boolean(applicationId) && !useMock;
  const query = useQuery({
    queryKey: queryKeys.serviceAccess(applicationId),
    queryFn: async ({ signal }) => {
      const response = await http.get<ApplicationResponse>(
        `/resident/applications/${encodeURIComponent(applicationId!)}`,
        { signal },
      );
      if (!response.isSuccess) throw new ApiError(response.status, response.message, response.code);
      const result = response.result;
      if (
        !result ||
        typeof result.resultPublished !== 'boolean' ||
        ![null, 'RECEIVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(
          result.inspectionStatus ?? (result.inspectionStatus === null ? null : ''),
        )
      ) return 'unavailable' as const;
      return result.inspectionStatus === 'COMPLETED' && result.resultPublished
        ? ('allowed' as const)
        : ('blocked' as const);
    },
    enabled: canCheck,
    retry: false,
    staleTime: 0,
  });
  const mockAllowed = service === 'inspection'
    ? serviceAccessMock.risk === 'COMPLETED'
    : service === 'support'
      ? serviceAccessMock.inspection === 'COMPLETED_PUBLISHED'
      : serviceAccessMock.support === 'APPROVED';
  const status = useMock ? (mockAllowed ? 'allowed' : 'blocked') : !canCheck ? 'unavailable' : query.isFetching ? 'loading' : query.isError ? 'error' : query.data ?? 'loading';
  return { status, retry: query.refetch };
}
