import { Outlet, ScrollRestoration } from 'react-router';

/**
 * 모든 화면을 감싸는 루트 레이아웃.
 * 모바일 웹 기준(Figma 390 × 844). 데스크톱에서는 가운데 정렬된 앱 폭(max-w-app)으로 보여줍니다.
 */
export function AppLayout() {
  return (
    <div className="bg-page flex min-h-dvh justify-center">
      <div className="max-w-app bg-surface relative flex min-h-dvh w-full flex-col">
        <Outlet />
      </div>
      <ScrollRestoration />
    </div>
  );
}
