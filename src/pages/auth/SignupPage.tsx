import { useState, type SubmitEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { useSignup } from '@/api/auth';

/**
 * Figma: 회원가입 · 자체 계정 (1115:4798)
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const canSubmit =
    email.trim() !== '' && password !== '' && passwordConfirm !== '' && name.trim() !== '';

  async function handleSignup(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/.test(password)) {
      setError('비밀번호는 공백 없이 영문과 숫자를 포함해 8~64자로 입력해 주세요.');
      return;
    }
    setPending(true);
    try {
      await signup.mutateAsync({
        email: email.trim(),
        password,
        passwordConfirm,
        name: name.trim(),
      });
      navigate(PATHS.login, { replace: true, state: { signupComplete: true } });
    } catch (e) {
      setError(e instanceof Error ? e.message : '회원가입에 실패했어요.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen
      header={{
        title: '회원가입',
        onBack: () => navigate(PATHS.login),
      }}
      bottom={
        <Button
          type="submit"
          form="signup-form"
          disabled={!canSubmit}
          loading={pending}
          loadingText="가입 중…"
        >
          회원가입
        </Button>
      }
    >
      <form id="signup-form" onSubmit={handleSignup} className="flex flex-col pt-6">
        <h1 className="text-ink mb-8 text-[24px] font-bold">계정을 만들어 시작하세요</h1>

        <div className="flex flex-col gap-5">
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                className="text-muted flex h-11 w-11 items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          <TextField
            label={<span className="font-semibold">비밀번호 확인</span>}
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="비밀번호를 다시 입력해 주세요"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            rightSlot={
              <button
                type="button"
                aria-label={showPasswordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'}
                className="text-muted flex h-11 w-11 items-center justify-center"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          <TextField
            label={<span className="font-semibold">이름</span>}
            type="text"
            placeholder="이름을 입력해 주세요"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="text-primary mt-6 text-center text-sm"
          onClick={() => navigate(PATHS.login)}
        >
          로그인 화면으로 돌아가기
        </button>

        {error && (
          <p role="alert" className="text-danger mt-4 text-sm">
            {error}
          </p>
        )}
      </form>
    </Screen>
  );
}
