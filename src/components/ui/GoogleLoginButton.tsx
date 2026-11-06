import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useGoogleLogin, useLogin } from '@/api/auth';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { enablePush } from '@/api/notifications';

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let googleScript: Promise<void> | undefined;
function loadGoogle(): Promise<void> {
  if (window.google) return Promise.resolve();
  if (!googleScript) {
    googleScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        googleScript = undefined;
        reject(new Error('Google 로그인 서비스를 불러오지 못했어요.'));
      };
      document.head.appendChild(script);
    });
  }
  return googleScript;
}
export function GoogleLoginButton({
  mockLabel = '구글로 로그인 (목업)',
  mockIcon,
  mockClassName,
  googleContainerClassName,
}: {
  mockLabel?: string;
  mockIcon?: ReactNode;
  mockClassName?: string;
  googleContainerClassName?: string;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: authenticateGoogle } = useGoogleLogin();
  const login = useLogin();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (env.useMock || !clientId) return;
    let active = true;
    loadGoogle()
      .then(() => {
        if (!active || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            setError('');
            setPending(true);
            try {
              const result = await authenticateGoogle(credential);
              if (!result.requiresConsent) void enablePush();
              navigate(result.requiresConsent ? PATHS.consent : PATHS.home, { replace: true });
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Google 로그인에 실패했어요.');
            } finally {
              setPending(false);
            }
          },
        });
        ref.current.replaceChildren();
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: Math.min(ref.current.clientWidth, 350),
          locale: 'ko',
        });
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [clientId, navigate, authenticateGoogle]);
  if (env.useMock) {
    return (
      <div>
        <Button
          variant="secondary"
          loading={pending}
          leftIcon={mockIcon}
          className={mockClassName}
          onClick={async () => {
            setPending(true);
            setError('');
            try {
              const result = await login.mutateAsync({
                email: 'resident@example.com',
                password: 'password123',
              });
              navigate(result.requiresConsent ? PATHS.consent : PATHS.home, { replace: true });
            } catch (e) {
              setError(e instanceof Error ? e.message : '목업 로그인에 실패했어요.');
            } finally {
              setPending(false);
            }
          }}
        >
          {mockLabel}
        </Button>
        {error && (
          <p role="alert" className="text-danger text-caption">
            {error}
          </p>
        )}
      </div>
    );
  }
  if (!clientId)
    return <p className="text-caption text-muted text-center">Google 로그인 설정이 필요해요.</p>;
  return (
    <div aria-busy={pending}>
      <div
        ref={ref}
        className={`${googleContainerClassName ?? ''} ${pending ? 'pointer-events-none opacity-50' : ''}`}
      />
      {pending && <p className="text-caption">로그인 중이에요…</p>}
      {error && (
        <p role="alert" className="text-danger text-caption">
          {error}
        </p>
      )}
    </div>
  );
}
