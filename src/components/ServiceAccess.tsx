import { Outlet, useNavigate, useParams } from 'react-router';
import { useServiceAccess, type Service } from '@/api/serviceAccess';
import { Screen } from '@/components/layout';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { PATHS } from '@/constants/paths';

const blockedMessages: Record<Service, string> = {
  inspection: '현장점검을 진행하려면 먼저 침수 취약도 분석을 완료해 주세요.',
  support: '현장점검이 완료되고 결과가 공개된 후 지원사업을 신청할 수 있어요.',
  construction: '지원사업이 승인된 후 시공을 진행할 수 있어요.',
};

const titles: Record<Service, string> = {
  inspection: '침수 취약도 확인이 필요해요',
  support: '현장점검 결과 확인이 필요해요',
  construction: '지원사업 승인이 필요해요',
};

export function ServiceAccessDialog({ service, applicationId, onClose }: {
  service: Service;
  applicationId?: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { status, retry } = useServiceAccess(service, applicationId);
  const message = status === 'loading' ? '진입 조건을 확인하고 있어요.'
    : status === 'error' ? '상태를 확인하지 못했어요. 다시 시도해 주세요.'
    : status === 'blocked' ? blockedMessages[service]
    : status === 'allowed' ? '진입 조건을 확인했어요.'
    : '현재 진입 조건을 확인할 수 없어요. 상태 확인 기능을 준비하고 있어요.';
  return (
    <BottomSheet open onClose={onClose} title={status === 'blocked' ? titles[service] : '이용 안내'} contentClassName="py-2"
      footer={status === 'loading' ? undefined : (
        <Button className="!h-12" onClick={() => {
          if (status === 'error') void retry();
          else if (status === 'blocked' && service === 'inspection') navigate(PATHS.addressSearch);
          else onClose();
        }}>
          {status === 'error' ? '다시 시도' : status === 'blocked' && service === 'inspection' ? '침수 취약도 확인하기' : '확인'}
        </Button>
      )}
    >
      <p className="text-body text-body-text">{message}</p>
    </BottomSheet>
  );
}

export function ServiceAccessGuard({ service }: { service: Service }) {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { status } = useServiceAccess(service, applicationId);
  if (status === 'allowed') return <Outlet />;
  return (
    <Screen header={{ title: '이용 안내', onBack: false }}>
      <ServiceAccessDialog service={service} applicationId={applicationId} onClose={() => navigate(PATHS.home, { replace: true })} />
    </Screen>
  );
}
