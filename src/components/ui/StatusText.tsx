import type { ReactNode } from 'react';
import { AlertTriangle, CircleCheck, Info, Dot } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 상태 표시 (검토 완료 배지, 위험/주의 문구, 진행 상태 점)
 * 원칙: 색상만으로 의미를 전달하지 않고 항상 "아이콘 + 상태명"을 함께 씁니다.
 */
export type StatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

const toneClass: Record<StatusTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted',
};

const toneIcon: Record<StatusTone, typeof Info> = {
  primary: Info,
  success: CircleCheck,
  warning: AlertTriangle,
  danger: AlertTriangle,
  muted: Info,
};

export interface StatusTextProps {
  tone: StatusTone;
  children: ReactNode;
  /** 'icon'(기본) | 'dot'(신청 상세 우측 상단의 "● 접수" 형태) | 'none' */
  indicator?: 'icon' | 'dot' | 'none';
  className?: string;
}

export function StatusText({ tone, children, indicator = 'icon', className }: StatusTextProps) {
  const Icon = toneIcon[tone];

  return (
    <span className={cn('inline-flex items-center gap-1 text-caption', toneClass[tone], className)}>
      {indicator === 'icon' && <Icon size={16} aria-hidden />}
      {indicator === 'dot' && <Dot size={20} strokeWidth={6} aria-hidden className="-mx-1" />}
      {children}
    </span>
  );
}
