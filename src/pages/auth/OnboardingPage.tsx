import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomCTA } from '@/components/layout';
import { Button } from '@/components/ui';
import { GoogleLoginButton } from '@/components/ui/GoogleLoginButton';
import { PATHS } from '@/constants/paths';

/**
 * Figma: 온보딩 (1115:4758)
 * 로고 이미지: public/logo.svg
 */
export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <>
      <main className="px-gutter flex flex-1 flex-col items-center justify-center gap-4 pt-[clamp(24px,calc(100dvh-648px),152px)] pb-[clamp(24px,10.375dvh,83px)]">
        <img
          src="/logo.svg"
          alt="FLOUT 로고"
          className="h-auto w-[220px] max-w-full object-contain"
        />
        <p className="text-primary text-[30px] leading-9 font-bold">FLOUT</p>
      </main>
      <BottomCTA className="mb-[clamp(20px,7.875dvh,63px)] gap-3 [&]:px-10 [&]:pt-5 [&]:pb-5">
        <GoogleLoginButton
          mockLabel="구글로 로그인"
          mockIcon={<GoogleIcon />}
          mockClassName="text-[14px] leading-[22px] font-medium [&]:border-muted"
          googleContainerClassName="flex min-h-[52px] items-center justify-center"
        />
        <Button leftIcon={<Mail size={20} />} onClick={() => navigate(PATHS.login)}>
          이메일로 로그인
        </Button>
      </BottomCTA>
    </>
  );
}

export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
