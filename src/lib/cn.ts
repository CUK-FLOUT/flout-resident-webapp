import { clsx, type ClassValue } from 'clsx';

/** className 조합 헬퍼. `cn('base', isActive && 'active')` */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
