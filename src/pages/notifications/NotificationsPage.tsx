import { Bell } from 'lucide-react';
import { generatePath, useNavigate } from 'react-router';
import { useNotifications } from '@/api/notifications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { cn } from '@/lib/cn';
import type { AppNotification } from '@/types/domain';

const category = (type: AppNotification['type']) =>
  type.startsWith('SUPPORT') ? '지원' : type.startsWith('CONSTRUCTION') ? '시공' : '현장점검';

const DESTINATION = {
  INSPECTION_RECEIVED: PATHS.applicationHub,
  INSPECTION_SCHEDULED: PATHS.visit,
  INSPECTION_STARTED: PATHS.inspectionProgress,
  INSPECTION_RESULT_PUBLISHED: PATHS.resultRegistered,
  SUPPORT_RECEIVED: PATHS.supportStatus,
  SUPPORT_APPROVED: PATHS.supportStatus,
  SUPPORT_REJECTED: PATHS.supportStatus,
  CONSTRUCTION_SCHEDULED: PATHS.construction,
  CONSTRUCTION_STARTED: PATHS.constructionProgress,
  CONSTRUCTION_COMPLETED: PATHS.constructionComplete,
} satisfies Record<AppNotification['type'], string>;

const destination = ({ type, applicationId }: AppNotification) =>
  DESTINATION[type] ? generatePath(DESTINATION[type], { applicationId }) : PATHS.notifications;

const dayLabel = (iso: string) =>
  iso.slice(0, 10) === new Date().toLocaleDateString('sv-SE')
    ? '오늘'
    : iso.slice(5, 10).replace('-', '.');

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const navigate = useNavigate();
  const header = { title: '알림' };

  if (isLoading) {
    return (
      <Screen header={header} tab="notifications">
        <StateMessage>알림을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen
        header={header}
        tab="notifications"
        bottom={<Button onClick={() => refetch()}>다시 시도</Button>}
      >
        <StateMessage>알림을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  if (data.length === 0) {
    return (
      <Screen header={header} tab="notifications">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-15 text-center">
          <span className="bg-soft text-primary flex size-16 items-center justify-center rounded-full">
            <Bell size={24} aria-hidden />
          </span>
          <p className="text-title text-ink">아직 알림이 없어요</p>
          <p className="text-body text-muted">
            신청 진행 상황과 새로운 안내가 생기면
            <br />
            여기에서 알려드릴게요.
          </p>
        </div>
      </Screen>
    );
  }

  const items = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Screen header={header} tab="notifications">
      <div className="text-ink flex flex-col gap-7 pt-4">
        <h2 className="text-title">
          최근 진행된 일을
          <br />
          시간순으로 확인해요.
        </h2>

        <ol className="relative flex flex-col gap-5">
          <span aria-hidden className="bg-page absolute top-1.5 bottom-0 left-[66px] w-px" />
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => navigate(destination(item))}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="text-caption flex w-12 shrink-0 flex-col gap-1">
                  <span>{dayLabel(item.createdAt)}</span>
                  <span>{item.createdAt.slice(11, 16)}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'border-border relative size-3 shrink-0 rounded-full border-2',
                    item.read ? 'bg-border' : 'bg-primary',
                  )}
                />
                <span className="flex flex-1 flex-col gap-2 py-1">
                  <span className="text-caption flex flex-col gap-1">
                    <span>
                      {category(item.type)} · {item.applicationId}
                    </span>
                    <span className={cn(!item.read && 'text-primary')}>
                      {item.title}
                      {!item.read && <span className="sr-only"> (읽지 않음)</span>}
                    </span>
                  </span>
                  <span className="text-body">{item.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Screen>
  );
}
