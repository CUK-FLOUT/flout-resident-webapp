import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Figma: 디자인 시스템 › 11 · Bottom sheet (1162:911)
 * 하단 고정 · 배경 Dim · 본문이 길어질 때 시트 내부만 스크롤.
 * 상단 radius 12 · Drag handle · 닫기(X) · 선택적으로 하단 고정 CTA(footer).
 *
 * 사용 예: 04 해결 여부 확인 / 10 지원 신청 / 13-1 방문전 확인 / 16-1 알림 상세
 */
export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** 시트 상단 작은 라벨 (예: "지원 신청") */
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** 시트 하단에 고정되는 CTA 영역 */
  footer?: ReactNode;
  /** Dim 클릭으로 닫기 허용 여부 */
  dismissible?: boolean;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  eyebrow,
  title,
  description,
  children,
  footer,
  dismissible = true,
  className,
}: BottomSheetProps) {
  const titleId = useId();

  // ESC로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center">
      {/* Dim overlay — Figma: Dim opacity 28% + 배경 blur */}
      <div
        aria-hidden
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={dismissible ? onClose : undefined}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'absolute bottom-0 flex max-h-[90dvh] w-full max-w-app flex-col rounded-t-xl bg-surface pb-[env(safe-area-inset-bottom)]',
          className,
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <span aria-hidden className="h-1 w-10 rounded-full bg-border" />
        </div>

        <header className="flex items-start justify-between gap-4 px-gutter pt-2">
          <div className="flex flex-col gap-2">
            {eyebrow && <p className="text-label text-ink">{eyebrow}</p>}
            {title && (
              <h2 id={titleId} className="text-heading text-ink">
                {title}
              </h2>
            )}
            {description && <p className="text-body text-body-text">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center text-primary"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-gutter py-4">{children}</div>

        {footer && <div className="px-gutter pt-2 pb-4">{footer}</div>}
      </section>
    </div>,
    document.body,
  );
}
