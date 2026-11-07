import { generatePath, useNavigate } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import {
  getInspectionAddress,
  getInspectionStatusLabel,
  getVisitDateTime,
} from '@/lib/inspectionApplication';
import { InspectionApplicationScreen } from './InspectionApplicationScreen';

export default function VisitPage() {
  const navigate = useNavigate();

  return (
    <InspectionApplicationScreen
      title="현장점검하기"
      backTo="applicationHub"
      bottom={(detail) =>
        detail.inspectionStatus === 'SCHEDULED' && (
          <Button
            onClick={() =>
              navigate(
                generatePath(PATHS.visitPrepare, { applicationId: String(detail.applicationId) }),
              )
            }
          >
            방문 전 안내
          </Button>
        )
      }
    >
      {(detail) => {
        const scheduled = detail.inspectionStatus === 'SCHEDULED';
        const visit = detail.progress?.visit;
        const dateTime = getVisitDateTime(visit?.scheduledAt);
        const status = getInspectionStatusLabel(detail);
        return (
          <div className="flex flex-col gap-4 py-5">
            <section className="flex flex-col gap-1.5">
              <h2 className="text-title">
                {scheduled && dateTime ? '일정 확정' : !dateTime ? '방문 일정 미정' : status}
              </h2>
              <p className="text-body">
                {scheduled && dateTime
                  ? '현장 점검 방문 일정이 확정됐어요.'
                  : !dateTime
                    ? '확인할 수 있는 확정 방문 일정이 없어요.'
                    : `현재 상태는 ${status}예요.`}
              </p>
              <p className="text-muted text-[13px] leading-[22px]">
                {scheduled && dateTime && '전문가가 방문해 실제 취약지점을 확인할 예정이에요.'}
              </p>
            </section>
            <hr className="border-page border-t" />
            <section aria-label="확정된 방문 일정" className="flex flex-col gap-3">
              <h3 className="text-caption text-muted">{scheduled ? '방문 예정' : '방문 일정'}</h3>
              <div className="flex items-center gap-4">
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-primary text-[32px] leading-10 font-semibold">
                    {dateTime?.monthDay ?? '미정'}
                  </p>
                  <p className="text-label">{dateTime?.weekday}</p>
                  <p className="text-muted text-[12px] leading-[18px]">
                    {dateTime && `${dateTime.year}년`}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 text-right">
                  <p className="text-caption text-muted">방문 시간</p>
                  <p className="text-[22px] leading-[30px] font-semibold">
                    {dateTime?.timeLabel ?? '미정'}
                  </p>
                </div>
              </div>
            </section>
            <hr className="border-page border-t" />
            <section>
              <h3 className="text-heading font-semibold">점검 정보</h3>
              <dl className="flex flex-col gap-3 pt-3 text-[13px] leading-[22px]">
                {[
                  ['주소', getInspectionAddress(detail)],
                  ['담당자', visit?.inspectorName?.trim() || '미배정'],
                  ['방문 전 안내', visit?.preVisitNotice?.trim() || '등록된 안내 없음'],
                  ['현재 상태', status],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="text-muted w-24 shrink-0">{label}</dt>
                    <dd className="min-w-0 flex-1 text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <hr className="border-page border-t" />
            <section className="flex flex-col gap-2">
              <h3 className="text-[15px] leading-6 font-semibold">방문 전에 확인해 주세요</h3>
              <p className="text-muted text-[13px] leading-[22px]">
                현장점검이 원활하게 진행될 수 있도록
                <br />
                간단한 준비사항을 안내해 드려요.
              </p>
            </section>
            <section className="flex flex-col gap-1">
              <h3 className="text-muted text-[12px] leading-5">배정 후 확정 일정</h3>
              <p className="text-[15px] leading-6 font-medium">
                {dateTime ? `${dateTime.date} / ${dateTime.time}` : '미정'}
              </p>
            </section>
          </div>
        );
      }}
    </InspectionApplicationScreen>
  );
}
