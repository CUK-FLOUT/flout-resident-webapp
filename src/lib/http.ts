import { PATHS } from '@/constants/paths';
import { env } from './env';
import { hasTokenPair, tokenStorage, type AuthSession } from './storage';

/**
 * fetch 래퍼. 모든 API 호출은 이 함수를 거칩니다.
 * - baseURL / JSON 직렬화 / 인증 헤더 / 타임아웃 / 에러 정규화
 * - 백엔드 응답 포맷이 { data, message } 형태로 정해지면 unwrap 부분만 수정하세요.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

async function requestOnce<T>(
  method: Method,
  path: string,
  opts: RequestOptions,
  accessToken?: string,
): Promise<T> {
  if (opts.signal?.aborted) throw opts.signal.reason;
  const url = new URL(`${env.apiBaseUrl}${path}`);
  Object.entries(opts.query ?? {}).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  const headers = new Headers({ Accept: 'application/json', ...opts.headers });
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body; // 사진·서류 업로드 — Content-Type은 브라우저가 boundary 포함해 설정
  } else if (opts.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(opts.body);
  }

  // AbortSignal.any/timeout 은 iOS 17.4 미만에서 없어서 직접 구현 (구형 기기 사용자 고려)
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs ?? 15_000);
  const onOuterAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onOuterAbort);

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body, signal: controller.signal });
  } catch (e) {
    if (timedOut) {
      throw new ApiError(0, '응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.', 'TIMEOUT');
    }
    if (opts.signal?.aborted) throw e; // React Query 취소는 그대로 전달
    throw new ApiError(0, '네트워크 연결을 확인해 주세요.', 'NETWORK');
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onOuterAbort);
  }

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (data ?? {}) as { message?: string; code?: string };
    throw new ApiError(res.status, responseMessage(err.message), err.code);
  }

  return data as T;
}

function responseMessage(message: unknown) {
  return typeof message === 'string' && message.trim() ? message : '요청을 처리하지 못했어요.';
}

/** 공개 인증 API는 Authorization과 401 복구를 거치지 않습니다. */
async function postPublic<T>(path: string, body: unknown): Promise<T> {
  const data = await requestOnce<{
    isSuccess: boolean;
    status?: number;
    message?: string;
    code?: string;
    result?: T;
  }>('POST', path, { body });
  if (!data?.isSuccess)
    throw new ApiError(data?.status ?? 200, responseMessage(data?.message), data?.code);
  if (data.result == null) throw new ApiError(data.status ?? 200, '서버 응답을 확인할 수 없어요.');
  return data.result;
}

function sameSession(a: AuthSession | null, b: AuthSession | null) {
  if (!a || !b) return a === b;
  return a.id === b.id && (a.id !== null || a.accessToken === b.accessToken);
}

function sameTokens(a: AuthSession | null, b: AuthSession | null) {
  return (
    sameSession(a, b) && a?.accessToken === b?.accessToken && a?.refreshToken === b?.refreshToken
  );
}

let redirecting = false;

function expireSession(expected: AuthSession | null) {
  if (!sameTokens(tokenStorage.readSession(), expected)) return;
  tokenStorage.clear();
  if (!redirecting && window.location.pathname !== PATHS.login) {
    redirecting = true;
    window.location.replace(PATHS.login);
  }
}

async function rotateSession(sent: AuthSession): Promise<AuthSession | null> {
  const current = tokenStorage.readSession();
  if (!current || !sameSession(current, sent)) return null;
  if (!sameTokens(current, sent)) return current;
  if (!current.id || !current.refreshToken) {
    expireSession(current);
    return null;
  }
  try {
    const result = await postPublic<unknown>('/auth/refresh', {
      refreshToken: current.refreshToken,
    });
    if (
      !hasTokenPair(result) ||
      !('role' in result) ||
      result.role !== 'RESIDENT' ||
      result.refreshToken === current.refreshToken
    )
      throw new ApiError(401, '재발급된 주민 인증 정보를 확인할 수 없어요.');
    if (sameTokens(tokenStorage.readSession(), current)) {
      if (!tokenStorage.rotate(current.id, result)) {
        expireSession(current);
        return null;
      }
    }
  } catch {
    expireSession(current);
  }
  const latest = tokenStorage.readSession();
  return sameSession(latest, current) && !sameTokens(latest, current) ? latest : null;
}

let refreshing: { session: AuthSession; promise: Promise<AuthSession | null> } | undefined;

async function recoverSession(sent: AuthSession | null): Promise<AuthSession | null> {
  if (!sent) {
    expireSession(null);
    return null;
  }
  const current = tokenStorage.readSession();
  if (!sameSession(current, sent)) return null;
  if (!sameTokens(current, sent)) return current;
  if (refreshing && sameSession(refreshing.session, sent)) return refreshing.promise;

  const promise = navigator.locks
    ? navigator.locks.request('flout.auth.refresh', () => rotateSession(sent))
    : rotateSession(sent);
  const attempt = { session: sent, promise };
  refreshing = attempt;
  try {
    return await promise;
  } catch {
    expireSession(sent);
    return null;
  } finally {
    if (refreshing === attempt) refreshing = undefined;
  }
}

async function request<T>(method: Method, path: string, opts: RequestOptions = {}): Promise<T> {
  const sent = tokenStorage.readSession();
  try {
    return await requestOnce<T>(method, path, opts, sent?.accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || env.useMock) throw error;
    if (opts.signal?.aborted) throw opts.signal.reason;
    const renewed = await recoverSession(sent);
    const latest = tokenStorage.readSession();
    if (!renewed || !latest || !sameSession(latest, renewed)) throw error;
    try {
      return await requestOnce<T>(method, path, opts, latest.accessToken);
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) expireSession(latest);
      throw retryError;
    }
  }
}

export const http = {
  postPublic,
  get: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
