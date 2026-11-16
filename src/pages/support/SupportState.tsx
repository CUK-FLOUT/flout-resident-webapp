import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';

export function SupportState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <Screen
      header={{ title: '지원하기' }}
      tab="home"
      bottom={retry && <Button onClick={retry}>다시 시도</Button>}
    >
      <StateMessage>{message}</StateMessage>
    </Screen>
  );
}
