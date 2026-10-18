import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 버튼형 선택지 그룹 (Figma: 03 현장점검 신청 › 거주 형태 / 과거 침수 경험 / 물이 들어온 곳)
 * - multiple=false : 단일 선택 (radio)
 * - multiple=true  : 복수 선택 (checkbox) — "여러 곳 선택 가능"
 * 선택 상태는 primary 외곽선으로 표시합니다.
 */
export interface ChoiceOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface BaseProps<T extends string> {
  label?: ReactNode;
  options: readonly ChoiceOption<T>[];
  columns?: 2 | 3;
  className?: string;
}

interface SingleProps<T extends string> extends BaseProps<T> {
  multiple?: false;
  value: T | null;
  onChange: (value: T) => void;
}

interface MultiProps<T extends string> extends BaseProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
}

export type ChoiceGroupProps<T extends string> = SingleProps<T> | MultiProps<T>;

export function ChoiceGroup<T extends string>(props: ChoiceGroupProps<T>) {
  const { label, options, columns = 3, className } = props;
  const labelId = useId();

  const isSelected = (v: T) => (props.multiple ? props.value.includes(v) : props.value === v);

  const toggle = (v: T) => {
    if (props.multiple) {
      const next = props.value.includes(v)
        ? props.value.filter((x) => x !== v)
        : [...props.value, v];
      props.onChange(next);
    } else {
      props.onChange(v);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <p id={labelId} className="text-section text-ink">
          {label}
        </p>
      )}
      <div
        role={props.multiple ? 'group' : 'radiogroup'}
        aria-labelledby={label ? labelId : undefined}
        className={cn('grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}
      >
        {options.map((opt) => {
          const selected = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              role={props.multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => toggle(opt.value)}
              className={cn(
                'bg-surface text-label h-11 rounded-md border',
                selected
                  ? 'border-primary text-ink ring-primary ring-1'
                  : 'border-border text-body-text',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
