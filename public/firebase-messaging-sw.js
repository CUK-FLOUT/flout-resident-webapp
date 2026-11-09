const TARGET_PATHS = {
  INSPECTION_RECEIVED: '',
  INSPECTION_SCHEDULED: '/visit',
  INSPECTION_STARTED: '/inspection/progress',
  INSPECTION_RESULT_PUBLISHED: '/result/registered',
  SUPPORT_RECEIVED: '/support/status',
  SUPPORT_APPROVED: '/support/status',
  SUPPORT_REJECTED: '/support/status',
  CONSTRUCTION_SCHEDULED: '/construction',
  CONSTRUCTION_STARTED: '/construction/progress',
  CONSTRUCTION_COMPLETED: '/construction/complete',
};

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { notification, data } = event.data.json();
  if (!notification) return;
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/notification-icon.png',
      data,
      tag: data?.eventId,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { notificationType, applicationId } = event.notification.data ?? {};
  const suffix = TARGET_PATHS[notificationType];
  const path =
    suffix !== undefined && applicationId
      ? `/applications/${encodeURIComponent(applicationId)}${suffix}`
      : '/notifications';
  event.waitUntil(self.clients.openWindow(path));
});
