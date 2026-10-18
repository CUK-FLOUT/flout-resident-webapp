import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AppHeader, type AppHeaderProps } from './AppHeader';

/**
 * 화면 기본 구조 (Figma: 03 · Layout & spacing)
 *   Header 56  →  Scroll viewport (좌우 20px)  →  Bottom CTA 84 (하단 고정)
 * 본문 스크롤과 고정 행동 영역을 분리합니다.
 *
 * @example
 * <Screen header={{ title: '취약도 결과' }} bottom={<Button>현장점검 신청하기</Button>}>
 *   ...본문
 * </Screen>
 */
export interface ScreenProps {
  /** 헤더 props. 생략하면 헤더 없음 (홈·온보딩) */
  header?: AppHeaderProps;
  /** 하단 고정 CTA 영역. 버튼 1~2개 */
  bottom?: ReactNode;
  children: ReactNode;
  className?: string;
  /** 본문 좌우 여백 제거 (지도·전체폭 이미지 등) */
  bleed?: boolean;
}

export function Screen({ header, bottom, children, className, bleed }: ScreenProps) {
  return (
    <>
      {header && <AppHeader {...header} />}
      <main className={cn('flex flex-1 flex-col', !bleed && 'px-gutter', 'pb-6', className)}>
        {children}
      </main>
      {bottom && <BottomCTA>{bottom}</BottomCTA>}
    </>
  );
}

/** 하단 고정 CTA. 버튼 여러 개면 세로로 쌓입니다(gap 8). */
export function BottomCTA({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 flex flex-col gap-2 bg-surface px-gutter pt-4 pb-[max(16px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {children}
    </div>
  );
}
