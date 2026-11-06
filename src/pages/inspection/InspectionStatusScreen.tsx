import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout';

export function InspectionStatusScreen({
  title,
  backTo,
  bottom,
  children,
}: {
  title: string;
  backTo: string;
  bottom?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh flex-col overflow-hidden [&>div]:shrink-0 [&>div>div]:pt-3 [&>div>div]:pb-5">
      <Screen
        header={{
          title,
          onBack: () => {
            if (window.history.state?.idx > 0) navigate(-1);
            else navigate(backTo);
          },
          className: 'px-5 [&_h1]:text-[18px] [&_h1]:leading-6 [&_svg]:size-6',
        }}
        tab="home"
        bottom={bottom}
        className="min-h-0 overflow-y-auto"
      >
        {children}
      </Screen>
    </div>
  );
}
