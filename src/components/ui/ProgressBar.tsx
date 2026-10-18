import { cn } from '@/lib/cn';

/**
 * Figma: 디자인 시스템 › 10 · Feedback & progress (1162:887)
 * - ProgressBar : "2 / 4 완료", 신청 폼 단계(1/3) 표시
 * - StepProgress: 지원 진행 "접수–검토–동의–결과" 처럼 이름 있는 단계
 */
export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <p className="text-label text-primary">{label}</p>}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className="h-1 w-full overflow-hidden rounded-full bg-border/50"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export interface StepProgressProps {
  steps: readonly string[];
  /** 현재 단계 index (0부터) */
  current: number;
  className?: string;
}

export function StepProgress({ steps, current, className }: StepProgressProps) {
  const pct = steps.length > 1 ? ((current + 0.5) / steps.length) * 100 : 100;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border/50">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <ol
        className="grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step, i) => (
          <li
            key={step}
            aria-current={i === current ? 'step' : undefined}
            className={cn(
              'text-caption',
              i <= current ? 'text-ink' : 'text-muted',
              i === current && 'font-bold',
            )}
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
