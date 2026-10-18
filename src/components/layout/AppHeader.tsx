import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';

/**
 * Figma: 디자인 시스템 › 12 · Navigation (1162:1045)
 * Header · 높이 56 · 44px Back 터치 영역 · 가운데 제목(Section 16 Bold)
 */
export interface AppHeaderProps {
  title?: ReactNode;
  /** false면 뒤로가기 숨김. 함수면 기본 동작(navigate(-1)) 대신 실행 */
  onBack?: false | (() => void);
  /** 오른쪽 슬롯 (예: 알림 화면의 '모두 읽음') */
  right?: ReactNode;
  className?: string;
}

export function AppHeader({ title, onBack, right, className }: AppHeaderProps) {
  const navigate = useNavigate();
  const showBack = onBack !== false;

  return (
    <header
      className={cn(
        'h-header bg-surface sticky top-0 z-20 grid shrink-0 grid-cols-[44px_1fr_44px] items-center px-2',
        className,
      )}
    >
      {showBack ? (
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={typeof onBack === 'function' ? onBack : () => navigate(-1)}
          className="text-primary flex size-11 items-center justify-center"
        >
          <ChevronLeft size={26} />
        </button>
      ) : (
        <span />
      )}
      <h1 className="text-section text-ink truncate text-center">{title}</h1>
      <div className="flex items-center justify-end">{right}</div>
    </header>
  );
}
