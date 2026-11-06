import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { ApiError, http } from '@/lib/http';
import { fcmTokenStorage } from '@/lib/storage';
import type { AppNotification } from '@/types/domain';
import { mockNotifications } from './mocks';
import { queryKeys, withMock } from './queryClient';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () =>
      withMock(
        () => (new URLSearchParams(location.search).has('empty') ? [] : mockNotifications),
        () =>
          http.get<AppNotification[]>('/notifications').catch((e: unknown) => {
            if (e instanceof ApiError && e.status === 404) return [];
            throw e;
          }),
      ),
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
