import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 라벨 ↔ 값 행 목록 (지원 신청 시트의 "이름 · 이OO", 신청 정보 화면 등)
 */
export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
}

export function KeyValueList({ items, className }: { items: KeyValueItem[]; className?: string }) {
  return (
    <dl className={cn('flex flex-col gap-3', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start justify-between gap-4">
          <dt className="text-body text-body-text shrink-0">{item.label}</dt>
          <dd className="text-label text-ink text-right font-bold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
