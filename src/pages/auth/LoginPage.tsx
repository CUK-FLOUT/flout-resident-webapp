import { useRef, useState, type SubmitEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { useLogin } from '@/api/auth';
import { enablePush } from '@/api/notifications';
import { GoogleLoginButton } from '@/components/ui/GoogleLoginButton';
import { GoogleIcon } from '@/pages/auth/OnboardingPage';

/**
 * Figma: 로그인 · 이메일 및 Google (1116:1389)
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  async function handleLogin(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    setError('');

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 100) {
      setError('올바른 이메일을 100자 이내로 입력해 주세요.');
      return;
    }
    if (password.length > 64) {
      setError('비밀번호는 64자 이내로 입력해 주세요.');
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const result = await login.mutateAsync({ email: email.trim(), password });
      if (!result.requiresConsent) void enablePush();
      navigate(result.requiresConsent ? PATHS.consent : PATHS.home, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했어요.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <Screen
      header={{
        title: '로그인',
        onBack: () => navigate(PATHS.onboarding),
      }}
    >
      <div className="flex flex-1 flex-col pt-[66px]">
        <div className="mb-2.5 flex h-9 items-center gap-3">
          <img src="/logo.svg" alt="" className="h-auto w-11 object-contain" />

          <h1 className="text-primary text-title">FLOUT</h1>
        </div>

        <p className="text-body-text text-body mb-7">우리 집의 침수 위험을 확인하고 예방하세요.</p>
        {location.state?.signupComplete && (
          <p role="status" className="text-success mb-4">
            회원가입이 완료됐어요. 로그인해 주세요.
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <TextField
            label={<span className="font-bold">이메일</span>}
            type="email"
            placeholder="이메일을 입력해 주세요"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label={<span className="font-bold">비밀번호</span>}
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해 주세요"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                className="text-primary flex h-11 w-11 items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            }
          />

          {error && (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-1" loading={pending} loadingText="로그인 중…">
            로그인
          </Button>
        </form>

        <div className="text-body mt-4 flex items-center justify-center gap-1 whitespace-nowrap">
          <span className="text-body-text">아직 계정이 없으신가요?</span>
          <button
            type="button"
            className="text-primary text-[15px] font-semibold underline"
            onClick={() => navigate(PATHS.signup)}
          >
            회원가입
          </button>
        </div>

        <div className="text-body text-body-text mt-7 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span>또는</span>
          <span className="bg-border h-px flex-1" />
        </div>
        <div className="mt-6">
          <GoogleLoginButton
            mockLabel="구글로 로그인"
            mockIcon={<GoogleIcon />}
            mockClassName="text-[14px] leading-[22px] font-medium"
            googleContainerClassName="flex min-h-[52px] items-center justify-center"
          />
        </div>
      </div>
    </Screen>
  );
}
