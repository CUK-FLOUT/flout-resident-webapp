import { ApiError } from '@/lib/http';
import type { LoginResult, SignupInput } from '@/api/auth';
import { mockDelay } from '@/api/mocks';

// 가입 정보와 비밀번호는 메모리에만 보관합니다.
const users = new Map<string, { password: string; name: string; consent: boolean }>([
  ['resident@example.com', { password: 'password123', name: '홍길동', consent: false }],
]);
interface MockSession {
  email: string;
  name: string;
  consent: boolean;
}
const sessionKey = 'flout.mockSession';
let memorySession: MockSession | null = null;

function readSession(): MockSession | null {
  try {
    const stored = sessionStorage.getItem(sessionKey);
    if (!stored) return memorySession;
    const value: unknown = JSON.parse(stored);
    if (
      typeof value === 'object' &&
      value !== null &&
      'email' in value &&
      'name' in value &&
      'consent' in value &&
      typeof value.email === 'string' &&
      typeof value.name === 'string' &&
      typeof value.consent === 'boolean'
    )
      return value as MockSession;
  } catch {
    /* 저장소가 차단되면 메모리 세션만 사용합니다. */
  }
  return memorySession;
}

function writeSession(session: MockSession) {
  memorySession = session;
  try {
    sessionStorage.setItem(sessionKey, JSON.stringify(session));
  } catch {
    /* 메모리 세션 유지 */
  }
}

export async function mockSignup(input: SignupInput) {
  await mockDelay();
  if (users.has(input.email)) throw new ApiError(409, '이미 가입된 이메일입니다.');
  users.set(input.email, { password: input.password, name: input.name, consent: false });
  return { userId: users.size, email: input.email, name: input.name, role: 'RESIDENT' as const };
}

export async function mockLogin(email: string, password: string): Promise<LoginResult> {
  await mockDelay();
  const user = users.get(email);
  if (!user || user.password !== password)
    throw new ApiError(401, '이메일과 비밀번호를 다시 확인해 주세요.');
  const previous = readSession();
  if (previous?.email === email) user.consent = previous.consent;
  writeSession({ email, name: user.name, consent: user.consent });
  return {
    accessToken: 'mock-access-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    expiresAt: '',
    userId: 1,
    email,
    name: user.name,
    role: 'RESIDENT',
    refreshToken: 'mock-refresh-token',
    refreshExpiresIn: 604800,
    refreshExpiresAt: '',
    requiresConsent: !user.consent,
  };
}

export async function mockConsent() {
  await mockDelay();
  const session = readSession();
  if (!session) throw new ApiError(401, '먼저 로그인해 주세요.');
  const user = users.get(session.email);
  if (user) user.consent = true;
  writeSession({ ...session, consent: true });
  return { requiresConsent: false };
}
