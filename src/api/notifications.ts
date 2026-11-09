import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { http } from '@/lib/http';
import { fcmTokenStorage } from '@/lib/storage';
import type { AppNotification } from '@/types/domain';
import { mockNotifications } from './mocks';
import { queryKeys, withMock } from './queryClient';

interface NotificationEnvelope<T> {
  isSuccess: boolean;
  message: string;
  result: T;
}

function unwrapNotification<T>(envelope: NotificationEnvelope<T>): T {
  if (!envelope?.isSuccess || envelope.result == null)
    throw new Error(envelope?.message || '알림 정보를 처리하지 못했어요.');
  return envelope.result;
}

type ResidentNotification = Omit<AppNotification, 'id' | 'applicationId'> & {
  notificationId: number;
  applicationId: number;
};

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: ({ signal }) =>
      withMock(
        () => (new URLSearchParams(location.search).has('empty') ? [] : mockNotifications),
        async () => {
          const items = unwrapNotification(
            await http.get<NotificationEnvelope<ResidentNotification[]>>(
              '/resident/notifications',
              { signal },
            ),
          );
          if (!Array.isArray(items)) throw new Error('알림 목록 응답을 확인할 수 없어요.');
          return items.map(({ notificationId, applicationId, ...item }) => ({
            ...item,
            id: String(notificationId),
            applicationId: String(applicationId),
          }));
        },
      ),
  });
}

export function useHasUnreadNotifications() {
  const { data } = useQuery({
    queryKey: queryKeys.unreadNotifications(),
    queryFn: ({ signal }) =>
      withMock(
        () => mockNotifications.some((n) => !n.read),
        async () =>
          unwrapNotification(
            await http.get<NotificationEnvelope<{ hasUnread: boolean }>>(
              '/resident/notifications/unread-status',
              { signal },
            ),
          ).hasUnread,
      ),
  });
  return data ?? false;
}

export function useReadAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      withMock<unknown>(
        () => undefined,
        () => http.patch('/resident/notifications/read-all'),
      ),
    onSuccess: () => qc.setQueryData(queryKeys.unreadNotifications(), false),
  });
}

export async function requestPushPermission() {
  if ('Notification' in window) await Notification.requestPermission();
}

export async function syncPushToken() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const [{ initializeApp }, { getMessaging, getToken, isSupported }] = await Promise.all([
      import('firebase/app'),
      import('firebase/messaging'),
    ]);
    if (!(await isSupported())) return;

    const token = await getToken(getMessaging(initializeApp(env.firebase)), {
      vapidKey: env.firebaseVapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
      ),
    });
    const previousToken = fcmTokenStorage.get();

    await withMock<unknown>(
      () => undefined,
      () =>
        http.put('/notifications/tokens', {
          token,
          previousToken: previousToken && previousToken !== token ? previousToken : undefined,
        }),
    );
    fcmTokenStorage.set(token);
  } catch (e) {
    console.error('FCM 토큰 등록 실패', e);
  }
}

export function enablePush() {
  return requestPushPermission().then(syncPushToken);
}
