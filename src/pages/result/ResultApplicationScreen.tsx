import type { ReactNode } from 'react';
import { generatePath, useParams } from 'react-router';
import { parseInspectionApplicationId, useInspectionApplication } from '@/api/applications';
import { useInspectionResult, type PublishedInspectionResult } from '@/api/inspectionResults';
import { StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS, type PathKey } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import type { InspectionApplicationDetail } from '@/types/domain';

type ResultScreenLocation = { title: string; backTo: string };

export function ResultState({
  title,
  backTo,
  message,
  retry,
}: ResultScreenLocation & { message: string; retry?: () => void }) {
  return (
    <InspectionStatusScreen
      title={title}
      backTo={backTo}
      bottom={retry && <Button onClick={retry}>다시 시도</Button>}
    >
      <div role={retry ? 'alert' : 'status'}>
        <StateMessage>{message}</StateMessage>
      </div>
    </InspectionStatusScreen>
  );
}

export type ResultApplication = ResultScreenLocation & {
  applicationId: string;
  application: InspectionApplicationDetail;
};

type ResultApplicationScreenProps = {
  title: string;
  backTo: PathKey;
  allowUnpublished?: boolean;
  children: (props: ResultApplication) => ReactNode;
};

export function ResultApplicationScreen({
  title,
  backTo,
  allowUnpublished,
  children,
}: ResultApplicationScreenProps) {
  const { applicationId: routeId } = useParams<'applicationId'>();
  const id = parseInspectionApplicationId(routeId);
  const applicationId = id === undefined ? undefined : String(id);
  const application = useInspectionApplication(applicationId, { refetchUnpublished: true });
  const location = {
    title,
    backTo: applicationId ? generatePath(PATHS[backTo], { applicationId }) : PATHS.applicationsAll,
  };
  if (applicationId === undefined)
    return <ResultState {...location} message="신청 번호를 확인할 수 없어요." />;
  if (
    application.isPending ||
    (application.isFetching && application.data?.resultPublished === false)
  )
    return <ResultState {...location} message="신청 정보를 불러오고 있어요…" />;
  if (application.isError || !application.data)
    return (
      <ResultState
        {...location}
        message="신청 정보를 불러오지 못했어요."
        retry={() => void application.refetch()}
      />
    );
  if (!allowUnpublished && application.data.resultPublished !== true)
    return (
      <ResultState
        {...location}
        message="아직 점검 결과가 공개되지 않았어요."
        retry={() => void application.refetch()}
      />
    );
  return children({ ...location, applicationId, application: application.data });
}

export type PublishedResultProps = ResultApplication & { result: PublishedInspectionResult };

function PublishedResult({
  children,
  ...application
}: ResultApplication & { children: (props: PublishedResultProps) => ReactNode }) {
  const result = useInspectionResult(application.application.applicationId);
  const location = { title: application.title, backTo: application.backTo };
  if (result.isPending) return <ResultState {...location} message="점검 결과를 불러오고 있어요…" />;
  if (result.isError || !result.data)
    return (
      <ResultState
        {...location}
        message="점검 결과를 불러오지 못했어요."
        retry={() => void result.refetch()}
      />
    );
  return children({ ...application, result: result.data });
}

export function PublishedResultScreen({
  children,
  ...props
}: Pick<ResultApplicationScreenProps, 'title' | 'backTo'> & {
  children: (props: PublishedResultProps) => ReactNode;
}) {
  return (
    <ResultApplicationScreen {...props}>
      {(application) => <PublishedResult {...application}>{children}</PublishedResult>}
    </ResultApplicationScreen>
  );
}
