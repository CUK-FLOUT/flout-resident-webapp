import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'soft' | 'text' | 'muted';
type Size = 'lg' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  /** loading 동안 보여줄 문구. 없으면 children 유지 */
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary active:brightness-90',
  secondary: 'border border-border bg-surface text-ink active:bg-page',
  soft: 'border border-primary bg-soft text-primary active:brightness-95',
  text: 'bg-transparent text-primary underline-offset-4 active:underline',
  muted: 'bg-border text-muted',
};

const sizeClass: Record<Size, string> = {
  lg: 'h-13 px-4 text-button', // 52px
  md: 'h-11 px-4 text-label', // 44px
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'lg',
    fullWidth = true,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md transition-[filter,background-color]',
        sizeClass[size],
        fullWidth && 'w-full',
        !isDisabled && variantClass[variant],
        isDisabled && (variant === 'text' ? 'text-muted bg-transparent' : 'bg-border text-muted'),
        className,
      )}
      {...rest}
    >
      {leftIcon}
      <span>{loading && loadingText ? loadingText : children}</span>
      {rightIcon}
    </button>
  );
});
