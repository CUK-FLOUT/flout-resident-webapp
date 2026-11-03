import type { StatusTone } from '@/components/ui';
import { APPLICATION_STAGE } from '@/constants/labels';
import { cn } from '@/lib/cn';
import type { ApplicationStage } from '@/types/domain';

const TONE_CLASS: Record<StatusTone, string> = {
  primary: 'bg-soft text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-page text-muted',
};

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  const { label, tone } = APPLICATION_STAGE[stage];
  return (
    <span
      className={cn(
        'shrink-0 rounded-md px-2 py-1 text-[12px] leading-5 font-medium',
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
