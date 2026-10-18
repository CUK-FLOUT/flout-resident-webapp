import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Figma: 06 · Text field › 추가 설명 · 128px Textarea */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, containerClassName, className, id, rows = 5, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-label text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-describedby={helperText ? `${inputId}-desc` : undefined}
        className={cn(
          'min-h-32 w-full resize-none rounded-md border border-border bg-surface px-4 py-3 text-body text-ink outline-none placeholder:text-muted focus:border-primary',
          className,
        )}
        {...rest}
      />
      {helperText && (
        <p id={`${inputId}-desc`} className="text-caption text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});
