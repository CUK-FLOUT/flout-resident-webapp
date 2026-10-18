import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Figma: 디자인 시스템 › 09 · Card & status (1162:839)
 * 안내·서류·알림에 필요한 표면만 사용하고, 일반 본문은 카드 없이 구성합니다.
 * neutral surface(page) 배경 · radius 6 · padding 16 · 그림자 없음
 */
export interface InfoCardProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  /** 하단 링크형 행동 ("동의 자료 확인 →") */
  action?: { label: ReactNode; onClick: () => void };
  className?: string;
}

export function InfoCard({ eyebrow, title, children, action, className }: InfoCardProps) {
  return (
    <section className={cn('bg-page flex flex-col gap-2 rounded-md p-4', className)}>
      {eyebrow && <p className="text-caption text-body-text">{eyebrow}</p>}
      {title && <p className="text-section text-ink">{title}</p>}
      {children && <div className="text-body text-body-text">{children}</div>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-label text-ink mt-1 flex items-center justify-between"
        >
          {action.label}
          <ArrowRight size={18} className="text-primary" />
        </button>
      )}
    </section>
  );
}
