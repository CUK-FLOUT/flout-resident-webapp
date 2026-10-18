import { cn } from '@/lib/cn';

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-border/60 border-0 border-t', className)} />;
}
