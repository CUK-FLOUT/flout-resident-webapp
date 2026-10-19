import { useState, type SubmitEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { GoogleIcon } from './OnboardingPage';

/**
 * Figma: 로그인 · 이메일 및 Google (1116:1389)
 */
export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleLogin(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    // TODO(auth): 추후 백엔드 로그인 API 연결
  }

  return (
    <Screen
      header={{
        title: '로그인',
        onBack: () => navigate(PATHS.onboarding),
      }}
    >
      <div className="flex flex-1 flex-col pt-20">
        <div className="mb-2 flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10 object-contain" />

          <h1 className="text-ink text-[30px] font-bold tracking-wide">FLOUT</h1>
        </div>

        <p className="text-body-text mb-8 text-sm">우리 집의 침수 위험을 확인하고 예방하세요.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <TextField
            label={<span className="font-semibold">이메일</span>}
            type="email"
            placeholder="이메일을 입력해 주세요"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label={<span className="font-semibold">비밀번호</span>}
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해 주세요"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                className="text-muted flex h-11 w-11 items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          {error && (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          )}

          <Button type="submit">로그인</Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="text-muted text-sm">아직 계정이 없으신가요?</span>
          <button
            type="button"
            className="text-primary text-sm font-semibold underline"
            onClick={() => navigate(PATHS.signup)}
          >
            회원가입
          </button>
        </div>

        <div className="my-8 flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted text-sm">또는</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <Button
          variant="secondary"
          leftIcon={<GoogleIcon />}
          onClick={() => {
            // TODO(auth): 추후 Google 로그인 API 연결
          }}
        >
          구글로 로그인
        </Button>
      </div>
    </Screen>
  );
}
