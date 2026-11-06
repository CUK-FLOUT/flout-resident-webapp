import { useState } from 'react';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Screen } from '@/components/layout';
import { Button, CheckItem } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { useSaveConsent } from '@/api/auth';
import { requestPushPermission, syncPushToken } from '@/api/notifications';

export default function ConsentPage() {
  const navigate = useNavigate();
  const saveConsent = useSaveConsent();

  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  const [agreeRequiredNotice, setAgreeRequiredNotice] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = agreeThirdParty && agreeRequiredNotice;

  async function handleSubmit() {
    if (!canSubmit) return;

    setError('');
    setPending(true);
    const permission = requestPushPermission();
    try {
      const result = await saveConsent.mutateAsync();
      if (result.requiresConsent) throw new Error('동의가 완료되지 않았어요. 다시 시도해 주세요.');
      void permission.then(syncPushToken);
      navigate(PATHS.home, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : '동의를 저장하지 못했어요.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen
      header={{
        title: '정보 제공 동의',
        onBack: () => navigate(-1),
      }}
      bottom={
        <Button
          disabled={!canSubmit}
          loading={pending}
          loadingText="저장 중…"
          onClick={handleSubmit}
        >
          동의하고 시작하기
        </Button>
      }
    >
      <div className="flex flex-col pt-10">
        <p className="text-muted text-sm">서비스 시작 전</p>

        <h1 className="text-ink mt-4 text-[24px] leading-snug font-bold">
          필요한 정보만 확인하고
          <br />
          동의해 주세요.
        </h1>

        <h2 className="text-ink mt-8 text-[18px] font-bold">동의 항목</h2>

        <div className="mt-8 flex flex-col gap-5">
          <CheckItem
            variant="checklist"
            checked={agreeThirdParty}
            onChange={setAgreeThirdParty}
            title={
              <span className="font-bold">
                <span className="text-primary">필수</span> 개인정보 제3자 제공
              </span>
            }
            description="현장점검 및 행정 처리를 위해 부천시에 제공해요."
            className="px-3 py-3 [&>span:first-child]:mt-1"
          />

          <CheckItem
            variant="checklist"
            checked={agreeRequiredNotice}
            onChange={setAgreeRequiredNotice}
            title={
              <span className="font-bold">
                <span className="text-primary">필수</span> 진행상태 알림 수신
              </span>
            }
            description="서비스 이용과 신청자 확인을 위해 사용해요"
            className="px-3 py-3 [&>span:first-child]:mt-1"
          />
        </div>
        {error && (
          <p role="alert" className="text-danger mt-4">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-start gap-3">
          <Info className="text-primary mt-0.5 size-5 shrink-0" />

          <p className="text-muted text-sm leading-relaxed">
            필수 항목에 동의하지 않으면 현장점검 및 지원 서비스를 이용할 수 없어요.
          </p>
        </div>
      </div>
    </Screen>
  );
}
