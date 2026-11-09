import { Bell, ClipboardCheck, House } from 'lucide-react';
import { Link } from 'react-router';
import { useHasUnreadNotifications } from '@/api/notifications';
import { PATHS } from '@/constants/paths';
import { cn } from '@/lib/cn';

/**
 * Figma: Resident/Bottom Navigation (1466:2893)
 * 주민용 공통 하단탭 · 390 × 84 · 3등분 · 선택된 탭은 soft 배경 아이콘 + primary Bold 라벨.
 * 알림 탭에는 읽지 않은 알림이 있을 때 점을 표시합니다.
 */
export type BottomNavTab = 'home' | 'applications' | 'notifications';

const tabs = [
  { key: 'home', label: '홈', to: PATHS.home, Icon: House },
  { key: 'applications', label: '내 신청', to: PATHS.applicationsAll, Icon: ClipboardCheck },
  { key: 'notifications', label: '알림', to: PATHS.notifications, Icon: Bell },
] as const;

export function BottomNav({ active }: { active: BottomNavTab }) {
  const hasUnread = useHasUnreadNotifications();

  return (
    <nav
      aria-label="주요 메뉴"
      className="border-border bg-surface flex border-t px-3 pt-[17px] pb-[max(17px,env(safe-area-inset-bottom))]"
    >
      {tabs.map(({ key, label, to, Icon }) => {
        const selected = key === active;
        return (
          <Link
            key={key}
            to={to}
            aria-current={selected ? 'page' : undefined}
            className="flex h-[50px] flex-1 flex-col items-center justify-center gap-1"
          >
            <span
              className={cn(
                'relative flex size-6 items-center justify-center rounded-lg',
                selected ? 'bg-soft text-primary' : 'text-muted',
              )}
            >
              <Icon size={20} aria-hidden />
              {key === 'notifications' && hasUnread && (
                <span className="bg-danger absolute -top-0.5 -right-0.5 size-2 rounded-full">
                  <span className="sr-only">읽지 않은 알림 있음</span>
                </span>
              )}
            </span>
            <span
              className={cn(
                'text-[12px] leading-[18px]',
                selected ? 'text-primary font-bold' : 'text-muted',
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
