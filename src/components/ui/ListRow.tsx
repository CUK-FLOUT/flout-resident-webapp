import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 탭하면 다른 화면으로 이동하는 행 (신청 상세의 "일정 배정 후 확인할 수 있어요 >",
 * 해결 여부 시트의 "해결했어요 / 여기서 마칠게요 >")
 * - variant 'plain'   : 구분선만 있는 행
 * - variant 'outlined': 외곽선 박스 행 (바텀시트 선택지)
 */
export interface ListRowProps {
  title: ReactNode;
  description?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'plain' | 'outlined';
  className?: string;
}

export function ListRow({
  title,
  description,
  onClick,
  disabled,
  variant = 'plain',
  className,
}: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between gap-3 text-left',
        variant === 'outlined' ? 'border-border rounded-md border p-4' : 'py-4',
        disabled && 'opacity-60',
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className={cn(variant === 'outlined' ? 'text-section' : 'text-label', 'text-ink')}>
          {title}
        </span>
        {description && <span className="text-caption text-muted">{description}</span>}
      </span>
      <ChevronRight size={20} className={disabled ? 'text-border' : 'text-primary'} aria-hidden />
    </button>
  );
}
