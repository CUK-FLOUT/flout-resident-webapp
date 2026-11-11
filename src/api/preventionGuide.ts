import { ApiError, http } from '@/lib/http';
import type { GuideResolution, PreventionGuide, RiskLevel } from '@/types/domain';

interface GuideResponse {
  guideId: number;
  assessmentId: number;
  title: string;
  subtitle: string;
  grade: RiskLevel;
  completedCount: number;
  totalCount: number;
  resolution?: GuideResolution | null;
  items: {
    itemId: number;
    order: number;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

interface GuideEnvelope {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: GuideResponse | null;
}

function readGuide(
  response: GuideEnvelope,
  assessmentId: string,
  guideId: string,
): PreventionGuide {
  if (!response?.isSuccess || !response.result)
    throw new ApiError(
      response?.isSuccess ? 502 : (response?.status ?? 502),
      response?.message || '예방 가이드 정보를 확인할 수 없어요.',
      response?.code,
    );
  const result = response.result;
  if (
    result.assessmentId !== Number(assessmentId) ||
    result.guideId !== Number(guideId) ||
    typeof result.title !== 'string' ||
    typeof result.subtitle !== 'string' ||
    !['HIGH', 'CAUTION', 'LOW'].includes(result.grade) ||
    (result.resolution != null &&
      result.resolution !== 'CONFIRMED' &&
      result.resolution !== 'NEEDS_INSPECTION') ||
    !Array.isArray(result.items) ||
    result.items.some(
      (item) =>
        !item ||
        !Number.isSafeInteger(item.itemId) ||
        item.itemId <= 0 ||
        !Number.isSafeInteger(item.order) ||
        typeof item.title !== 'string' ||
        typeof item.description !== 'string' ||
        typeof item.completed !== 'boolean',
    ) ||
    new Set(result.items.map((item) => item.itemId)).size !== result.items.length ||
    result.totalCount !== result.items.length ||
    result.completedCount !== result.items.filter((item) => item.completed).length
  )
    throw new ApiError(502, '예방 가이드 정보를 확인할 수 없어요.');

  return {
    id: guideId,
    assessmentId,
    title: result.title,
    subtitle: result.subtitle,
    grade: result.grade,
    completedCount: result.completedCount,
    totalCount: result.totalCount,
    resolution: result.resolution ?? null,
    items: [...result.items]
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: String(item.itemId),
        title: item.title,
        description: item.description,
        done: item.completed,
      })),
  };
}

export async function getPreventionGuide(
  assessmentId: string,
  guideId: string,
  signal?: AbortSignal,
) {
  const response = await http.get<GuideEnvelope>(`/resident/prevention-guides/${guideId}`, {
    signal,
  });
  return readGuide(response, assessmentId, guideId);
}

export type GuideUpdate = { itemId: string; completed: boolean } | { resolution: GuideResolution };

export async function savePreventionGuide(guide: PreventionGuide, update: GuideUpdate) {
  const response =
    'itemId' in update
      ? await http.patch<GuideEnvelope>(`/resident/guide-items/${update.itemId}/progress`, {
          completed: update.completed,
        })
      : await http.patch<GuideEnvelope>(
          `/resident/prevention-guides/${guide.id}/resolution`,
          update,
        );
  const saved = readGuide(response, guide.assessmentId, guide.id);
  const persisted =
    'itemId' in update
      ? saved.items.find((item) => item.id === update.itemId)?.done === update.completed
      : saved.resolution === update.resolution;
  if (!persisted) throw new ApiError(502, '저장된 예방 가이드 상태를 확인할 수 없어요.');
  return saved;
}
