import type { ReactNode } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { parseInspectionApplicationId, useInspectionApplication } from '@/api/applications';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { ApiError } from '@/lib/http';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import type { InspectionApplicationDetail } from '@/types/domain';

export function InspectionApplicationScreen({
  title,
  backTo,
  bottom,
  children,
}: {
  title: string;
  backTo: 'home' | 'applicationHub' | 'visit';
  bottom?: (detail: InspectionApplicationDetail) => ReactNode;
  children: (detail: InspectionApplicationDetail) => ReactNode;
}) {
  const { applicationId } = useParams<'applicationId'>();
  const id = parseInspectionApplicationId(applicationId);
  const application = useInspectionApplication(applicationId);
  const navigate = useNavigate();
  const fallback =
    id === undefined
      ? PATHS.applicationsAll
      : generatePath(PATHS[backTo], { applicationId: String(id) });

  if (application.isLoading)
    return (
      <InspectionStatusScreen title={title} backTo={fallback}>
        <p role="status" className="text-body text-muted pt-10 text-center">
          신청 정보를 불러오고 있어요…
        </p>
      </InspectionStatusScreen>
    );

  if (id === undefined || application.isError || !application.data) {
    const status = application.error instanceof ApiError ? application.error.status : undefined;
    let message = '신청 정보를 불러오지 못했어요.';
    let action = <Button onClick={() => void application.refetch()}>다시 시도</Button>;
    if (id === undefined || status === 404 || status === 403 || !application.isError) {
      message =
        id === undefined ? '신청 번호를 확인할 수 없어요.' : '확인할 수 있는 신청 내역이 없어요.';
      action = <Button onClick={() => navigate(PATHS.applicationsAll)}>내 신청 보기</Button>;
    } else if (status === 401) {
      message = '로그인 후 신청 정보를 확인해 주세요.';
      action = <Button onClick={() => navigate(PATHS.login, { replace: true })}>로그인하기</Button>;
    }
    return (
      <InspectionStatusScreen title={title} backTo={fallback} bottom={action}>
        <p role="alert" className="text-body text-muted pt-10 text-center">
          {message}
        </p>
      </InspectionStatusScreen>
    );
  }

  return (
    <InspectionStatusScreen title={title} backTo={fallback} bottom={bottom?.(application.data)}>
      {children(application.data)}
    </InspectionStatusScreen>
  );
}
