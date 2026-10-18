import { useRouteError } from 'react-router';
import { Button } from '@/components/ui';
import { env } from '@/lib/env';

/** 렌더링 중 예외가 나면 보여주는 화면. AppLayout 바깥이라 자체 레이아웃을 가집니다. */
export default function RouteErrorPage() {
  const error = useRouteError();

  return (
    <div className="mx-auto flex min-h-dvh max-w-app flex-col justify-center gap-4 bg-surface px-gutter text-center">
      <p className="text-heading text-ink">문제가 발생했어요</p>
      <p className="text-body text-body-text">잠시 후 다시 시도해 주세요.</p>
      {env.isDev && (
        <pre className="overflow-auto rounded-md bg-page p-3 text-left text-caption text-danger">
          {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
        </pre>
      )}
      <Button onClick={() => window.location.assign('/')}>홈으로 가기</Button>
    </div>
  );
}
