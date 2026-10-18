import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import type { AppNotification } from '@/types/domain';
import { mockNotifications } from './mocks';
import { queryKeys, withMock } from './queryClient';

/* ── NOTI-01 ~ 08 알림 ─────────────────────────────────────────────
 * 발송(카카오 알림톡/SMS/푸시)은 백엔드 책임. 프론트는 알림함 목록·읽음 처리만 담당합니다.
 */

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () =>
      withMock(
        () => mockNotifications,
        () => http.get<AppNotification[]>('/notifications'),
      ),
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      withMock<void>(
        () => undefined,
        () => http.patch<void>(`/notifications/${id}/read`),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications() }),
  });
}
