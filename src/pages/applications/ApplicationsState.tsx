import type { ReactNode } from 'react';
import { Screen, StateMessage } from '@/components/layout';

export function ApplicationsState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Screen header={{ title }} tab="applications" bottom={action}>
      <StateMessage>{message}</StateMessage>
    </Screen>
  );
}
