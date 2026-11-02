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
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, '네트워크 연결을 확인해 주세요.', 'NETWORK');
  }
  const data = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !data?.isSuccess)
    throw new ApiError(response.status, data?.message ?? '요청을 처리하지 못했어요.', data?.code);
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
  tokenStorage.set(result.accessToken);
  return result;
}
export function signup(input: SignupInput) {
  if (env.useMock) return mockSignup(input);
  return publicPost<{ userId: number; email: string; name: string; role: string }>(
    '/auth/signup',
    input,
  );
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
import { useMutation } from '@tanstack/react-query';

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
