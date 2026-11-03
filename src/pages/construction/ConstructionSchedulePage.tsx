import { useState } from 'react';
import { Check, ChevronRight, Info, MapPin } from 'lucide-react';
import { generatePath, Navigate } from 'react-router';
import { BottomSheet, Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { formatDate, formatMonthDay, formatTime, formatWeekday } from '@/lib/date';
import { ConstructionScreen, InfoField } from './ConstructionScreen';

const checklist = (facility: string) => [
  { title: '작업 공간을 비워 주세요.', description: `${facility} 설치 위치 주변을 비워 주세요.` },
  {
    title: '현장 출입이 가능해야 해요.',
    description: '예정된 시간에 시공 위치로 들어갈 수 있도록 출입 가능 여부를 확인해 주세요.',
  },
  {
    title: '기존 시설은 그대로 두어 주세요.',
    description: '기존 침수 예방시설이 있다면 임의로 철거하지 말고 현재 상태를 유지해 주세요.',
  },
];

const RESCHEDULE_NOTE = '일정 변경이 필요한 경우 담당 안내를 통해 조율할 수 있어요.';

export default function ConstructionSchedulePage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <ConstructionScreen>
      {({ construction, application }) => {
        const { applicationId, status, scheduledAt, facility } = construction;
        if (status !== 'SCHEDULED') {
          const to =
            status === 'COMPLETED' ? PATHS.constructionComplete : PATHS.constructionProgress;
          return <Navigate to={generatePath(to, { applicationId })} replace />;
        }

        return (
          <>
            <section className="flex flex-col gap-2.5">
              <p className="text-caption flex items-center gap-2">
                <span aria-hidden className="bg-success size-1.5 rounded-full" />
                확정 일정
              </p>
              <h2 className="text-title">
                예방시설 시공 일정이
                <br />
                정해졌어요.
              </h2>
              <p className="text-body">아래 날짜와 방문 시간을 확인해 주세요.</p>
            </section>

            {scheduledAt && (
              <section className="flex flex-col gap-2 py-4">
                <p className="flex items-center gap-2">
                  <span className="text-title">{formatMonthDay(scheduledAt)}</span>
                  <span className="text-label">{formatWeekday(scheduledAt)}</span>
                </p>
                <p className="text-heading">{formatTime(scheduledAt)}</p>
              </section>
            )}

            <section className="flex flex-col gap-2">
              <p className="text-caption">시공 주소</p>
              <p className="text-label flex items-center gap-2">
                <MapPin size={20} aria-hidden className="shrink-0" />
                {application.request.address}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-caption">시공 내용</p>
              <p className="text-section">{facility}</p>
            </section>

            <section className="border-border flex flex-col gap-4 border-t pt-3.5">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="bg-page flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Info size={16} aria-hidden />
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-label">방문 전에 확인할 내용</span>
                  <span className="text-body">시공 전 준비사항을 확인해 주세요.</span>
                </span>
                <ChevronRight size={24} aria-hidden />
              </button>
              <p className="text-body">{RESCHEDULE_NOTE}</p>
            </section>

            {scheduledAt && (
              <InfoField label="접수번호 / 확정 시공일·시간">
                {applicationId} / {formatDate(scheduledAt)} · {scheduledAt.slice(11, 16)}
              </InfoField>
            )}

            <BottomSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              title={
                <span className="text-title block">
                  방문 전에
                  <br />
                  이것만 확인해 주세요.
                </span>
              }
              description="원활한 시공을 위해 필요한 준비사항이에요."
              footer={<Button onClick={() => setSheetOpen(false)}>확인했어요</Button>}
            >
              <ul className="text-ink flex flex-col gap-4">
                {checklist(facility).map((item) => (
                  <li key={item.title} className="flex items-center gap-3">
                    <span className="bg-page flex size-[22px] shrink-0 items-center justify-center rounded-full">
                      <Check size={14} strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-label">{item.title}</span>
                      <span className="text-body">{item.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-body text-ink mt-3">{RESCHEDULE_NOTE}</p>
            </BottomSheet>
          </>
        );
      }}
    </ConstructionScreen>
  );
}
