import { useSyncExternalStore } from 'react';
import { tokenStorage } from './storage';

export function useSessionScope() {
  return useSyncExternalStore(tokenStorage.subscribeToSession, tokenStorage.getSessionScope);
}
