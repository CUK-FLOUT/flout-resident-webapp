import { useState, type SubmitEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';

/**
 * Figma: 회원가입 · 자체 계정 (1115:4798)
 */
export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [error, setError] = useState('');

  const canSubmit =
    email.trim() !== '' &&
    password !== '' &&
    passwordConfirm !== '' &&
    name.trim() !== '' &&
    agreeTerms &&
    agreePrivacy;

  function handleSignup(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('모든 항목을 입력하고 필수 약관에 동의해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO(auth): 추후 회원가입 API 연결
  }

  return (
    <Screen
      header={{
        title: '회원가입',
        onBack: () => navigate(PATHS.login),
      }}
      bottom={
        <Button type="submit" form="signup-form" disabled={!canSubmit}>
          회원가입
        </Button>
      }
    >
      <form id="signup-form" onSubmit={handleSignup} className="flex flex-col pt-12">
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

        <section className="mt-8">
          <h2 className="text-ink mb-4 text-[18px] font-bold">서비스 이용 동의</h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-primary h-6 w-6 shrink-0"
              />

              <label htmlFor="agree-terms" className="text-ink flex-1 text-sm">
                이용약관 동의 (필수)
              </label>

              <button
                type="button"
                className="text-primary text-sm underline"
                onClick={() => {
                  // TODO: 이용약관 상세 화면 연결
                }}
              >
                보기
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="agree-privacy"
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="accent-primary h-6 w-6 shrink-0"
              />

              <label htmlFor="agree-privacy" className="text-ink flex-1 text-sm">
                개인정보 수집 및 이용 동의 (필수)
              </label>

              <button
                type="button"
                className="text-primary text-sm underline"
                onClick={() => {
                  // TODO: 개인정보 처리방침 상세 화면 연결
                }}
              >
                보기
              </button>
            </div>
          </div>
        </section>

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
