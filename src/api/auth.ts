import { useMutation } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { ApiError, http } from '@/lib/http';
import { hasTokenPair, tokenStorage } from '@/lib/storage';
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

export async function login(email: string, password: string) {
  if (env.useMock) return mockLogin(email, password);
  return saveLogin(await http.postPublic<LoginResult>('/auth/login', { email, password }));
}
export async function googleLogin(idToken: string) {
  return saveLogin(await http.postPublic<LoginResult>('/auth/google', { idToken }));
}
function saveLogin(result: LoginResult) {
  if (result.role !== 'RESIDENT') {
    throw new ApiError(403, '주민 계정으로 로그인해 주세요.');
  }
  if (!hasTokenPair(result) || typeof result.requiresConsent !== 'boolean') {
    throw new ApiError(200, '로그인 응답을 확인할 수 없어요.');
  }
  if (!tokenStorage.set(result)) throw new ApiError(0, '로그인 정보를 저장할 수 없어요.');
  return result;
}
export async function signup(input: SignupInput) {
  if (env.useMock) return mockSignup(input);
  const result = await http.postPublic<{
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

//로그아웃
export async function logout() {
  try {
    if (!env.useMock) await http.post('/auth/logout');
  } finally {
    tokenStorage.clear();
  }
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}