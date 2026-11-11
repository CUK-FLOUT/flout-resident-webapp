import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys, withMock } from '@/api/queryClient';
import { env } from '@/lib/env';
import { ApiError, http } from '@/lib/http';
import { tokenStorage } from '@/lib/storage';

export interface ResidentProgressIds {
  guideId: number | null;
  applicationId: number | null;
  inspectionId: number | null;
  supportApplicationId: number | null;
  constructionId: number | null;
  inspectionFormDraftId: string | null;
  supportFormDraftId: string | null;
}

export interface ResidentProgressItem {
  assessmentId: number;
  applicationType: 'RISK_ASSESSMENT' | 'INSPECTION' | 'SUPPORT';
  receiptNumber: string | null;
  title: string;
  address: string;
  detailAddress: string | null;
  riskLevel: string | null;
  currentStage: string;
  nextAction: { type: string; target: Record<string, unknown> } | null;
  relatedIds: ResidentProgressIds;
  stageHistory: { stage: string; occurredAt: string }[];
  closed: boolean;
  updatedAt: string | null;
}

export interface ResidentProgressPage {
  items: ResidentProgressItem[];
  nextCursor: string | null;
}

interface ProgressEnvelope {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: ResidentProgressPage | null;
}

const mockIds: ResidentProgressIds = {
  guideId: null,
  applicationId: null,
  inspectionId: null,
  supportApplicationId: null,
  constructionId: null,
  inspectionFormDraftId: null,
  supportFormDraftId: null,
};

const mockScheduled: ResidentProgressItem = {
  assessmentId: 1,
  applicationType: 'INSPECTION',
  receiptNumber: '000001',
  title: '현장점검 일정이 확정됐어요',
  address: '부천시 원미구 심곡로 12',
  detailAddress: null,
  riskLevel: 'HIGH',
  currentStage: 'VISIT_SCHEDULED',
  nextAction: { type: 'VIEW_VISIT_SCHEDULE', target: { applicationId: 1 } },
  relatedIds: { ...mockIds, applicationId: 1 },
  stageHistory: [],
  closed: false,
  updatedAt: '2026-10-21T10:00:00+09:00',
};

const mockProgress: ResidentProgressItem[] = [
  mockScheduled,
  {
    ...mockScheduled,
    assessmentId: 2,
    applicationType: 'SUPPORT',
    receiptNumber: '000002',
    title: '지원 신청을 검토 중이에요',
    address: '부천시 원미구 중동로 45',
    currentStage: 'SUPPORT_REVIEW',
    nextAction: { type: 'VIEW_SUPPORT_PROGRESS', target: { supportApplicationId: 2 } },
    relatedIds: { ...mockIds, applicationId: 2, supportApplicationId: 2 },
  },
  {
    ...mockScheduled,
    assessmentId: 9,
    receiptNumber: null,
    title: '현장점검 신청서 작성 중이에요',
    address: '부천시 원미구 송내로 78',
    currentStage: 'INSPECTION_FORM_EDITING',
    nextAction: {
      type: 'CONTINUE_INSPECTION_FORM',
      target: { draftId: 'd3b07384-d9a4-4f18-9b2b-80d1bcf67b29' },
    },
    relatedIds: { ...mockIds, inspectionFormDraftId: 'd3b07384-d9a4-4f18-9b2b-80d1bcf67b29' },
  },
];

export async function getResidentProgress({
  size,
  cursor,
  signal,
}: { size?: number; cursor?: string; signal?: AbortSignal } = {}): Promise<ResidentProgressPage> {
  return withMock(
    () => ({
      items: new URLSearchParams(window.location.search).has('empty')
        ? []
        : mockProgress.slice(0, size),
      nextCursor: null,
    }),
    async () => {
      const response = await http.get<ProgressEnvelope>('/resident/progress', {
        query: { size, cursor },
        signal,
      });
      if (!response?.isSuccess)
        throw new ApiError(
          response?.status ?? 502,
          response?.message || '진행 현황을 확인할 수 없어요.',
          response?.code,
        );
      const result = response.result;
      if (
        !Array.isArray(result?.items) ||
        result.items.some(
          (item) => !item || typeof item.title !== 'string' || typeof item.closed !== 'boolean',
        ) ||
        (result.nextCursor != null && typeof result.nextCursor !== 'string')
      )
        throw new ApiError(502, '진행 현황 응답을 확인할 수 없어요.');
      return { items: result.items, nextCursor: result.nextCursor ?? null };
    },
  );
}

function readSessionKey() {
  const session = tokenStorage.readSession();
  return env.useMock ? 'mock' : session ? (session.id ?? 'legacy') : null;
}

function subscribeToSession(listener: () => void) {
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

export const homeProgressLimit = 3;

export function useResidentProgress() {
  const session = useSyncExternalStore(subscribeToSession, readSessionKey);
  const query = useQuery({
    queryKey: queryKeys.residentProgress(session),
    queryFn: ({ signal }) => getResidentProgress({ size: homeProgressLimit, signal }),
    enabled: session !== null,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  return { ...query, signedIn: session !== null };
}
