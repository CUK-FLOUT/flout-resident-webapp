import { useMutation } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { ApiError, http } from '@/lib/http';
import { tokenStorage } from '@/lib/storage';
import { mockConsent, mockLogin, mockSignup } from '@/api/authMock';

interface Envelope<T> {
  isSuccess: boolean;
  message: string;
  code: string;
  result: T;
}
export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  userId: number;
  email: string;
  name: string;
  role: 'RESIDENT' | 'ADMIN';
  refreshToken: string;
  refreshExpiresIn: number;
  refreshExpiresAt: string;
  requiresConsent: boolean;
}
export interface SignupInput {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

// 인증 API에는 기존 Authorization 헤더를 보내지 않습니다.
async function publicPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15_000);
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    if (timedOut) {
      throw new ApiError(0, '응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.', 'TIMEOUT');
    }
    throw new ApiError(0, '네트워크 연결을 확인해 주세요.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
  const data = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !data?.isSuccess)
    throw new ApiError(
      response.status,
      data?.message?.trim() ? data.message : '요청을 처리하지 못했어요.',
      data?.code,
    );
  if (data.result == null) throw new ApiError(response.status, '서버 응답을 확인할 수 없어요.');
  return data.result;
}

export async function login(email: string, password: string) {
  if (env.useMock) return mockLogin(email, password);
  return saveLogin(await publicPost<LoginResult>('/auth/login', { email, password }));
}
export async function googleLogin(idToken: string) {
  return saveLogin(await publicPost<LoginResult>('/auth/google', { idToken }));
}
function saveLogin(result: LoginResult) {
  if (result.role !== 'RESIDENT') {
    throw new ApiError(403, '주민 계정으로 로그인해 주세요.');
  }
  if (
    typeof result.accessToken !== 'string' ||
    !result.accessToken.trim() ||
    typeof result.requiresConsent !== 'boolean'
  ) {
    throw new ApiError(200, '로그인 응답을 확인할 수 없어요.');
  }
  tokenStorage.set(result.accessToken);
  return result;
}
export async function signup(input: SignupInput) {
  if (env.useMock) return mockSignup(input);
  const result = await publicPost<{
    userId: number;
    email: string;
    name: string;
    role: 'RESIDENT';
  }>('/auth/signup', {
    email: input.email,
    password: input.password,
    passwordConfirm: input.passwordConfirm,
    name: input.name,
  });
  if (result.role !== 'RESIDENT' || !Number.isSafeInteger(result.userId) || result.userId <= 0) {
    throw new ApiError(201, '회원가입 응답을 확인할 수 없어요.');
  }
  return result;
}
export async function saveConsent() {
  if (env.useMock) return mockConsent();
  const response = await http.post<Envelope<{ requiresConsent: boolean }>>('/resident/consents', {
    thirdPartyProvisionAgreed: true,
    statusNotificationAgreed: true,
  });
  if (!response.isSuccess) throw new ApiError(0, response.message, response.code);
  return response.result;
}
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useGoogleLogin() {
  return useMutation({ mutationFn: googleLogin });
}

export function useSignup() {
  return useMutation({ mutationFn: signup });
}

export function useSaveConsent() {
  return useMutation({ mutationFn: saveConsent });
}
