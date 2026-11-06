const TARGET_PATHS = {
  INSPECTION_DETAIL: (applicationId) => `/applications/${encodeURIComponent(applicationId)}/detail`,
};

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { notification, data } = event.data.json();
  if (!notification) return;
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      data,
      tag: data?.eventId,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { target, applicationId } = event.notification.data ?? {};
  const toPath = TARGET_PATHS[target];
  const path = toPath && applicationId ? toPath(applicationId) : '/notifications';
  event.waitUntil(self.clients.openWindow(path));
});
