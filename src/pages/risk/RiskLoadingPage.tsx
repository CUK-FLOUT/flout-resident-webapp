import { useEffect, useState } from 'react';
import { generatePath, Navigate, useNavigate } from 'react-router';
import { useRiskAnalysis } from '@/api/riskAnalysis';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import { useAddressDraft } from '@/stores/addressDraft';

export default function RiskLoadingPage() {
  const navigate = useNavigate();
  const { mutateAsync } = useRiskAnalysis();
  const { address, coordinates, detail, floor, mockLevel } = useAddressDraft();
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address || !coordinates || !detail.trim() || !floor) return;
    let active = true;
    const input = { address, coordinates, detail: detail.trim(), floor };
    useAddressDraft.getState().setResult(null);
    mutateAsync({ input, level: mockLevel })
      .then((result) => {
        const current = useAddressDraft.getState();
        if (
          !active ||
          current.address !== address ||
          current.coordinates !== coordinates ||
          current.detail.trim() !== input.detail ||
          current.floor !== floor ||
          current.mockLevel !== mockLevel
        )
          return;
        current.setResult(result);
        navigate(generatePath(PATHS.riskResult, { assessmentId: result.id }), { replace: true });
      })
      .catch((e: unknown) => {
        if (active)
          setError(e instanceof Error ? e.message : '분석에 실패했어요. 다시 시도해 주세요.');
      });
    return () => {
      active = false;
    };
  }, [address, coordinates, detail, floor, mockLevel, attempt, navigate, mutateAsync]);

  if (!address || !coordinates) return <Navigate to={PATHS.addressSearch} replace />;
  if (!detail.trim() || !floor) return <Navigate to={PATHS.addressDetail} replace />;
  return (
    <Screen
      header={{
        title: '취약도 분석',
        onBack: () => navigate(PATHS.addressDetail),
        className: 'px-5 [&_h1]:text-[18px] [&_svg]:size-6',
      }}
      tab="home"
    >
      <div
        className="flex flex-col items-center gap-5 pt-14 text-center"
        role={error ? 'alert' : 'status'}
      >
        {error ? (
          <>
            <h1 className="text-heading">분석을 진행할 수 없어요</h1>
            <p className="text-body text-muted">{error}</p>
            {env.useMock && (
              <Button
                onClick={() => {
                  setError('');
                  setAttempt((value) => value + 1);
                }}
              >
                다시 시도
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate(PATHS.addressDetail)}>
              주소 확인하기
            </Button>
          </>
        ) : (
          <RiskLoadingContent />
        )}
      </div>
    </Screen>
  );
}

export function RiskLoadingContent() {
  return (
    <div className="flex flex-col items-center pt-[clamp(24px,19dvh,152px)]">
      <div
        className="border-border border-t-primary mb-5 size-14 animate-spin rounded-full border-[5px] motion-reduce:animate-none"
        aria-hidden
      />
      <h1 className="text-title">
        입력한 주소의
        <br />
        침수 취약도를 분석하고 있어요
      </h1>
      <p className="text-body text-muted mt-5">
        지형·배수 환경과 주변 침수 이력을 확인하고 있어요.
        <br />
        잠시만 기다려 주세요.
      </p>
    </div>
  );
}
