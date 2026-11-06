/**
 * localStorage 래퍼. 사파리 사생활 보호 모드 등에서 접근이 막혀도 앱이 죽지 않도록 try/catch 처리.
 */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* noop */
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
  token: 'flout.accessToken',
  recentAddresses: 'flout.recentAddresses',
  fcmToken: 'flout.fcmToken',
} as const;

export const fcmTokenStorage = {
  get: () => safeGet(KEYS.fcmToken),
  set: (token: string) => safeSet(KEYS.fcmToken, token),
};

export const tokenStorage = {
  get: () => safeGet(KEYS.token),
  set: (token: string) => safeSet(KEYS.token, token),
  clear: () => safeRemove(KEYS.token),
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
