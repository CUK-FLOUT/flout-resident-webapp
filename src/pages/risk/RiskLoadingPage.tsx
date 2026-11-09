import { useEffect, useRef, useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { useRiskAnalysis } from '@/api/riskAnalysis';
import spinnerArc from '@/assets/risk/spinner-arc.svg';
import spinnerRing from '@/assets/risk/spinner-ring.svg';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { ApiError, RefreshError } from '@/lib/http';
import { useAddressDraft } from '@/stores/addressDraft';

export default function RiskLoadingPage() {
  const navigate = useNavigate();
  const { mutateAsync } = useRiskAnalysis();
  const { address, coordinates, detail, floor, mockLevel } = useAddressDraft();
  const [attempt, setAttempt] = useState(0);
  const [failure, setFailure] = useState<{ message: string; retry: boolean }>();
  const request = useRef<{
    key: string;
    promise: ReturnType<typeof mutateAsync>;
  } | null>(null);

  useEffect(() => {
    if (!address || !coordinates || !detail.trim() || !floor) return;
    let active = true;
    const input = { address, coordinates, detail: detail.trim(), floor };
    const key = JSON.stringify([input, mockLevel, attempt]);
    if (request.current?.key !== key) {
      useAddressDraft.getState().setResult(null);
      request.current = { key, promise: mutateAsync({ input, level: mockLevel }) };
    }
    const isCurrent = () => {
      const current = useAddressDraft.getState();
      return (
        active &&
        current.address === address &&
        current.coordinates === coordinates &&
        current.detail.trim() === input.detail &&
        current.floor === floor &&
        current.mockLevel === mockLevel
      );
    };
    void request.current.promise
      .then((result) => {
        if (!isCurrent()) return;
        if (result.status === 'FAILED') {
          setFailure({ message: '분석을 완료하지 못했어요. 다시 시도해 주세요.', retry: true });
          return;
        }
        if (result.status === 'COMPLETED')
          useAddressDraft.getState().setResult({ ...result, input });
        const id = String(result.id);
        navigate(generatePath(PATHS.riskResult, { assessmentId: id }), {
          replace: true,
          state: { riskFloor: floor, assessmentId: id },
        });
      })
      .catch((error: unknown) => {
        if (!isCurrent()) return;
        const status = error instanceof ApiError ? error.status : undefined;
        setFailure({
          message:
            error instanceof RefreshError
              ? '로그인 상태를 갱신하지 못했어요. 잠시 후 다시 시도해 주세요.'
              : status === 401
                ? '로그인이 필요해요.'
                : status === 403
                  ? '주민 계정으로 로그인해 주세요.'
                  : status === 422
                    ? '이 주소는 현재 분석 대상 지역에 포함되지 않아요. 주소를 다시 확인해 주세요.'
                    : error instanceof Error
                      ? error.message
                      : '분석에 실패했어요. 다시 시도해 주세요.',
          retry: error instanceof RefreshError || ![400, 401, 403, 422].includes(status ?? 0),
        });
      });
    return () => {
      active = false;
    };
  }, [address, coordinates, detail, floor, mockLevel, attempt, navigate, mutateAsync]);

  const missing = !address || !coordinates || !detail.trim() || !floor;
  const addressPath = address && coordinates ? PATHS.addressDetail : PATHS.addressSearch;
  const back = () => navigate(addressPath);
  return (
    <Screen
      header={{
        title: '취약도 분석',
        onBack: back,
        className: 'px-5 [&_h1]:text-[18px] [&_svg]:size-6',
      }}
      tab="home"
    >
      {failure || missing ? (
        <div className="flex flex-col items-center gap-5 pt-14 text-center" role="alert">
          <h2 className="text-heading">분석을 진행할 수 없어요</h2>
          <p className="text-body text-muted">
            {missing ? '분석할 주소와 거주 층을 다시 확인해 주세요.' : failure?.message}
          </p>
          {failure?.retry && !missing && (
            <Button
              onClick={() => {
                setFailure(undefined);
                setAttempt((value) => value + 1);
              }}
            >
              다시 시도
            </Button>
          )}
          <Button variant="secondary" onClick={back}>
            주소 확인하기
          </Button>
        </div>
      ) : (
        <RiskLoadingContent />
      )}
    </Screen>
  );
}

export function RiskLoadingContent() {
  return (
    <div
      className="flex flex-col items-center pt-[clamp(32px,calc(50dvh-192px),208px)] text-center"
      role="status"
    >
      <div className="relative mb-5 size-14" aria-hidden>
        <img src={spinnerRing} alt="" width={56} height={56} />
        <span className="absolute inset-0 animate-spin motion-reduce:animate-none">
          <img src={spinnerArc} alt="" width={28} height={28} className="ml-auto" />
        </span>
      </div>
      <h2 className="text-title text-[clamp(19px,6.2vw,26px)] tracking-tight">
        입력한 주소의
        <br />
        침수 취약도를 분석하고 있어요
      </h2>
      <p className="text-body text-muted mt-5">
        지역 정보와 과거 침수 기록을 확인하고 있어요.
        <br />
        잠시만 기다려 주세요.
      </p>
    </div>
  );
}
