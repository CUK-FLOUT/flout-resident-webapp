import { env } from './env';
import { tokenStorage } from './storage';

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

async function request<T>(method: Method, path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(`${env.apiBaseUrl}${path}`);
  Object.entries(opts.query ?? {}).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  const headers = new Headers({ Accept: 'application/json', ...opts.headers });
  const token = tokenStorage.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);

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
    if (res.status === 401) tokenStorage.clear();
    throw new ApiError(res.status, err.message ?? '요청을 처리하지 못했어요.', err.code);
  }

  return data as T;
}

export const http = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
