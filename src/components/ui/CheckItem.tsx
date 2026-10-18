import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Figma: 디자인 시스템 › 08 · List & selection (1162:807)
 * - variant 'option'    : 미해결 사유처럼 한 줄 선택 항목 (선택 시 soft 배경 + primary 외곽선)
 * - variant 'checklist' : 예방 가이드 체크리스트 (제목 + 설명 + 메타)
 * 선택 여부는 체크 + 라벨로 함께 전달합니다. 긴 설명에도 체크박스 위치가 고정되도록 구성.
 */
export interface CheckItemProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  variant?: 'option' | 'checklist';
  className?: string;
}

export function CheckItem({
  checked,
  onChange,
  title,
  description,
  meta,
  variant = 'option',
  className,
}: CheckItemProps) {
  const isOption = variant === 'option';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-start gap-3 rounded-md p-4 text-left',
        isOption && 'border',
        isOption && (checked ? 'border-primary bg-soft' : 'border-border bg-surface'),
        !isOption && checked && 'bg-soft',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-px flex size-5 shrink-0 items-center justify-center rounded-sm border',
          checked ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface',
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn(isOption ? 'text-label' : 'text-section', 'text-ink')}>{title}</span>
        {description && <span className="text-body text-body-text">{description}</span>}
        {meta && (
          <span className={cn('text-caption', checked ? 'text-primary' : 'text-muted')}>
            {meta}
          </span>
        )}
      </span>
    </button>
  );
}
