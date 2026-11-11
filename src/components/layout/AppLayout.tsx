import { useEffect } from 'react';
import { matchPath, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { syncPushToken } from '@/api/notifications';
import { PATHS } from '@/constants/paths';
import { tokenStorage } from '@/lib/storage';
import { useSessionScope } from '@/lib/useSessionScope';

const authPaths = [PATHS.onboarding, PATHS.login, PATHS.signup, PATHS.consent];

export function AppLayout() {
  const { pathname } = useLocation();
  const session = useSessionScope();
  const authRoute = authPaths.some((path) => matchPath(path, pathname));
  useEffect(() => {
    if (tokenStorage.get()) void syncPushToken();
  }, []);

  return (
    <div className="bg-page flex min-h-dvh justify-center">
      <div className="max-w-app bg-surface relative flex min-h-dvh w-full flex-col">
        <Outlet key={authRoute ? 'auth' : (session ?? 'anonymous')} />
      </div>
      <ScrollRestoration />
    </div>
  );
}
