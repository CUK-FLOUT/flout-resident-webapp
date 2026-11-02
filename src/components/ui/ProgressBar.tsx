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
        className="bg-border/50 h-1 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width]"
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

/** Figma 04-5 progress-bar: 단계별 막대(완료·현재 primary) + 가운데 정렬 라벨(현재 단계 Bold) */
export function StepProgress({ steps, current, className }: StepProgressProps) {
  return (
    <ol className={cn('flex gap-2', className)}>
      {steps.map((step, i) => (
        <li
          key={step}
          aria-current={i === current ? 'step' : undefined}
          className="flex flex-1 flex-col gap-2"
        >
          <span
            aria-hidden
            className={cn('h-1 rounded-[2px]', i <= current ? 'bg-primary' : 'bg-border')}
          />
          <span
            className={cn(
              'text-caption text-center',
              i === current ? 'text-primary font-bold' : 'text-muted',
            )}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
