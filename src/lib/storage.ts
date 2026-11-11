function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

const KEYS = {
  authTokens: 'flout.authTokens',
  legacyAccessToken: 'flout.accessToken',
  recentAddresses: 'flout.recentAddresses',
  fcmToken: 'flout.fcmToken',
  supportApprovalSeen: 'flout.supportApprovalSeen',
} as const;

export const supportApprovalSeenStorage = {
  list(): number[] {
    try {
      return JSON.parse(safeGet(KEYS.supportApprovalSeen) ?? '[]') as number[];
    } catch {
      return [];
    }
  },
  has(id: number) {
    return this.list().includes(id);
  },
  add(id: number) {
    if (!this.has(id)) safeSet(KEYS.supportApprovalSeen, JSON.stringify([...this.list(), id]));
  },
};

export const fcmTokenStorage = {
  get: () => safeGet(KEYS.fcmToken),
  set: (token: string) => safeSet(KEYS.fcmToken, token),
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  id: string | null;
  accessToken: string;
  refreshToken: string | null;
}

export function hasTokenPair(value: unknown): value is TokenPair {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    Boolean(value.accessToken.trim()) &&
    'refreshToken' in value &&
    typeof value.refreshToken === 'string' &&
    Boolean(value.refreshToken.trim())
  );
}

function readSession(): AuthSession | null {
  try {
    const value: unknown = JSON.parse(safeGet(KEYS.authTokens) ?? 'null');
    if (hasTokenPair(value) && 'id' in value && typeof value.id === 'string') {
      return { id: value.id, accessToken: value.accessToken, refreshToken: value.refreshToken };
    }
  } catch {
    // 저장값을 읽지 못하면 기존 access token을 확인합니다.
  }
  const accessToken = safeGet(KEYS.legacyAccessToken);
  return accessToken ? { id: null, accessToken, refreshToken: null } : null;
}

function writeTokens(id: string, { accessToken, refreshToken }: TokenPair) {
  if (!safeSet(KEYS.authTokens, JSON.stringify({ id, accessToken, refreshToken }))) return false;
  safeRemove(KEYS.legacyAccessToken);
  return true;
}

const sessionListeners = new Set<() => void>();
let legacyScope: { accessToken: string; id: string } | undefined;
let legacyGeneration = 0;

function getSessionScope(): string | null {
  const session = readSession();
  if (!session || session.id !== null) {
    legacyScope = undefined;
    return session?.id ?? null;
  }
  if (legacyScope?.accessToken !== session.accessToken)
    legacyScope = { accessToken: session.accessToken, id: `legacy:${++legacyGeneration}` };
  return legacyScope.id;
}

function subscribeToSession(listener: () => void) {
  sessionListeners.add(listener);
  const onStorage = ({ key }: StorageEvent) => {
    if (key === null || key === KEYS.authTokens || key === KEYS.legacyAccessToken) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    sessionListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export const tokenStorage = {
  get: () => readSession()?.accessToken ?? null,
  readSession,
  getSessionScope,
  subscribeToSession,
  set(tokens: TokenPair) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const saved = writeTokens(id, tokens);
    if (saved) sessionListeners.forEach((listener) => listener());
    return saved;
  },
  rotate: writeTokens,
  clear() {
    safeRemove(KEYS.authTokens);
    safeRemove(KEYS.legacyAccessToken);
    sessionListeners.forEach((listener) => listener());
  },
};

/** 홈 "최근 확인한 주소" (최대 3개) */
export interface RecentAddress {
  address: string;
  riskLabel: string;
  assessmentId: string;
}

export const recentAddressStorage = {
  list(): RecentAddress[] {
    try {
      return JSON.parse(safeGet(KEYS.recentAddresses) ?? '[]') as RecentAddress[];
    } catch {
      return [];
    }
  },
  push(item: RecentAddress) {
    const next = [item, ...this.list().filter((a) => a.address !== item.address)].slice(0, 3);
    safeSet(KEYS.recentAddresses, JSON.stringify(next));
  },
};
