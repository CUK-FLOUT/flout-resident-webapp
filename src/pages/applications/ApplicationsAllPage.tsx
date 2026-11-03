import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { useApplications } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date';
import type { ApplicationStage, ApplicationSummary } from '@/types/domain';
import { StageBadge } from './StageBadge';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'closed', label: '종료' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const CLOSED_STAGES: ApplicationStage[] = ['COMPLETED', 'SUPPORT_REJECTED'];

export default function ApplicationsAllPage() {
  const { data, isLoading, isError, refetch } = useApplications();
  const [tab, setTab] = useState<TabKey>('all');
  const header = { title: '내 신청' };

  if (isLoading) {
    return (
      <Screen header={header} tab="applications">
        <StateMessage>신청 기록을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen
        header={header}
        tab="applications"
        bottom={<Button onClick={() => refetch()}>다시 시도</Button>}
      >
        <StateMessage>신청 기록을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const items = data.filter(
    (a) => tab === 'all' || CLOSED_STAGES.includes(a.stage) === (tab === 'closed'),
  );

  return (
    <Screen header={header} tab="applications">
      <div className="flex flex-1 flex-col gap-6 pt-5">
        <h2 className="text-title text-ink">신청 기록</h2>

        <div role="tablist" className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'text-ink h-10 flex-1 border-b-2',
                tab === key ? 'border-primary text-label' : 'text-body border-transparent',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {data.length === 0 ? (
          <EmptyState />
        ) : items.length === 0 ? (
          <StateMessage>해당하는 신청이 없어요.</StateMessage>
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <ApplicationCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}

function ApplicationCard({ item }: { item: ApplicationSummary }) {
  const showResult = item.stage === 'INSPECTION_COMPLETED';

  return (
    <li className="border-border flex flex-col gap-2.5 rounded-xl border p-4">
      <div className="flex h-7 items-center justify-between gap-2">
        <span className="text-muted text-[12px] leading-[18px]">{formatDate(item.createdAt)}</span>
        <StageBadge stage={item.stage} />
      </div>
      <p className="text-ink text-[15px] leading-6 font-semibold">{item.title}</p>
      <p className="text-caption text-muted">
        {item.id} · {item.address}
      </p>
      <div className="text-caption flex items-center justify-between">
        {showResult && <span className="text-body-text">현장점검 결과</span>}
        <Link
          to={generatePath(showResult ? PATHS.result : PATHS.applicationDetail, {
            applicationId: item.id,
          })}
          className="text-primary ml-auto font-medium"
        >
          상세 보기 →
        </Link>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16 text-center">
      <ClipboardList size={40} strokeWidth={1.5} className="text-ink" aria-hidden />
      <p className="text-title text-ink">아직 신청 내역이 없어요</p>
      <p className="text-body text-muted">
        현장점검을 신청하면
        <br />
        이곳에서 진행상태를 확인할 수 있어요.
      </p>
    </div>
  );
}
