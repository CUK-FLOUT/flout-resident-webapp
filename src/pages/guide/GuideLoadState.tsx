import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';

export function GuideLoadState({
  error,
  retry,
  onBack,
}: {
  error?: string;
  retry?: () => void;
  onBack: () => void;
}) {
  return (
    <Screen
      header={{ title: '맞춤 예방 가이드', onBack }}
      tab="home"
      bottom={retry && <Button onClick={retry}>다시 시도</Button>}
    >
      <p role={error ? 'alert' : 'status'} className="text-body text-muted pt-10 text-center">
        {error || '표시할 예방 가이드가 없어요.'}
      </p>
    </Screen>
  );
}
