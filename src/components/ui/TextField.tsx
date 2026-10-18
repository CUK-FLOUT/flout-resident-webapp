import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Figma: 디자인 시스템 › 06 · Text field (1162:716)
 * 라벨 / 입력 영역 / 안내를 세로로 묶습니다.
 * - size lg : 입력 높이 52 (로그인·주소 검색)
 * - size md : 입력 높이 44 (신청 폼)
 * Border #C8D0D7 · radius 6 · 가로 padding 16 · 오른쪽 아이콘 터치 영역 44px
 */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  size?: 'lg' | 'md';
  /** 입력창 오른쪽 슬롯 (비밀번호 표시 버튼, 검색 아이콘 등) */
  rightSlot?: ReactNode;
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    errorText,
    size = 'lg',
    rightSlot,
    containerClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = `${inputId}-desc`;
  const hasError = Boolean(errorText);

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-label text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          'bg-surface focus-within:border-primary flex items-center rounded-md border pl-4',
          size === 'lg' ? 'h-13' : 'h-11',
          rightSlot ? 'pr-1' : 'pr-4',
          hasError ? 'border-danger' : 'border-border',
        )}
      >
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={helperText || errorText ? descId : undefined}
          className={cn(
            'text-body text-ink placeholder:text-muted h-full min-w-0 flex-1 bg-transparent outline-none',
            className,
          )}
          {...rest}
        />
        {rightSlot}
      </div>
      {(errorText || helperText) && (
        <p id={descId} className={cn('text-caption', hasError ? 'text-danger' : 'text-muted')}>
          {errorText ?? helperText}
        </p>
      )}
    </div>
  );
});
