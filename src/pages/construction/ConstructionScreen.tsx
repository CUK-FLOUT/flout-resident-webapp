import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { generatePath, Navigate, useParams } from 'react-router';
import { useInspectionApplication } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import type { ConstructionSchedule, ConstructionStatus } from '@/types/domain';

const header = { title: '시공하기' };

const PATH_BY_STATUS: Record<ConstructionStatus, string> = {
  PENDING: PATHS.supportStatus,
  SCHEDULED: PATHS.construction,
  IN_PROGRESS: PATHS.constructionProgress,
  COMPLETED: PATHS.constructionComplete,
};

export function ConstructionScreen<T extends ConstructionSchedule>({
  status,
  useDetail,
  children,
}: {
  status: ConstructionStatus;
  useDetail: (constructionId: number) => UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  const { applicationId } = useParams<'applicationId'>();
  const application = useInspectionApplication(applicationId);
  const constructionId = application.data?.progress?.constructionId ?? 0;
  const construction = useDetail(constructionId);

  if (application.isLoading || construction.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>시공 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (application.data && !constructionId) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>등록된 시공 정보가 없어요.</StateMessage>
      </Screen>
    );
  }

  if (!construction.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          <Button
            onClick={() => (application.data ? construction.refetch() : application.refetch())}
          >
            다시 시도
          </Button>
        }
      >
        <StateMessage>시공 정보를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  if (construction.data.status !== status) {
    return (
      <Navigate
        to={generatePath(PATH_BY_STATUS[construction.data.status], {
          applicationId: applicationId!,
        })}
        replace
      />
    );
  }

  return (
    <Screen header={header} tab="home">
      <div className="text-ink flex flex-col gap-[18px] pt-5">{children(construction.data)}</div>
    </Screen>
  );
}

export function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-caption">{label}</p>
      <p className="text-body">{children}</p>
    </div>
  );
}
