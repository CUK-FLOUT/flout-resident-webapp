import type { ReactNode } from 'react';
import { useParams } from 'react-router';
import { useApplication, useConstruction } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import type { ApplicationDetail, Construction } from '@/types/domain';

export function ConstructionScreen({
  children,
}: {
  children: (data: { construction: Construction; application: ApplicationDetail }) => ReactNode;
}) {
  const { applicationId } = useParams<'applicationId'>();
  const construction = useConstruction(applicationId);
  const application = useApplication(applicationId);
  const header = { title: '시공하기' };

  if (construction.isLoading || application.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>시공 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!construction.data || !application.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          <Button
            onClick={() => {
              construction.refetch();
              application.refetch();
            }}
          >
            다시 시도
          </Button>
        }
      >
        <StateMessage>시공 정보를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  return (
    <Screen header={header} tab="home">
      <div className="text-ink flex flex-col gap-[18px] pt-5">
        {children({ construction: construction.data, application: application.data })}
      </div>
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
