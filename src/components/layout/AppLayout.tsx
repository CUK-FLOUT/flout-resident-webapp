import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { syncPushToken } from '@/api/notifications';
import { tokenStorage } from '@/lib/storage';


export function AppLayout() {
  useEffect(() => {
    if (tokenStorage.get()) void syncPushToken();
  }, []);

  return (
    <div className="bg-page flex min-h-dvh justify-center">
      <div className="max-w-app bg-surface relative flex min-h-dvh w-full flex-col">
        <Outlet />
      </div>
      <ScrollRestoration />
    </div>
  );
}
