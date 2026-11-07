import { generatePath, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { inspectionVisitMock as visit } from './inspectionVisitMock';

/**
 * Figma: 03-8 현장점검하기_점검예정 (1115:3024)
 * 기능명세: STATUS-03, NOTI-02, NOTI-03
 */
export default function VisitPage() {
  const navigate = useNavigate();
  const { applicationId = '000001' } = useParams<'applicationId'>();

  return (
    <InspectionStatusScreen
      title="현장점검하기"
      backTo={generatePath(PATHS.applicationHub, { applicationId })}
      bottom={
        <Button onClick={() => navigate(generatePath(PATHS.visitPrepare, { applicationId }))}>
          방문 전 안내
        </Button>
      }
    >
      <div className="flex flex-col gap-4 py-5">
        <section className="flex flex-col gap-1.5">
          <h2 className="text-title">일정 확정</h2>
          <p className="text-body">현장 점검 방문 일정이 확정됐어요.</p>
          <p className="text-muted text-[13px] leading-[22px]">
            전문가가 방문해 실제 취약지점을 확인할 예정이에요.
          </p>
        </section>
        <hr className="border-page border-t" />
        <section aria-label="확정된 방문 일정" className="flex flex-col gap-3">
          <h3 className="text-caption text-muted">방문 예정</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-primary text-[32px] leading-10 font-semibold">{visit.monthDay}</p>
              <p className="text-label">{visit.weekday}</p>
              <p className="text-muted text-[12px] leading-[18px]">{visit.year}</p>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-right">
              <p className="text-caption text-muted">방문 시간</p>
              <p className="text-[22px] leading-[30px] font-semibold">{visit.timeLabel}</p>
            </div>
          </div>
        </section>
        <hr className="border-page border-t" />
        <section>
          <h3 className="text-heading font-semibold">점검 정보</h3>
          <dl className="flex flex-col gap-3 pt-3 text-[13px] leading-[22px]">
            {[
              ['주소', visit.address],
              ['방문 전 안내', visit.preparation],
              ['현재 상태', visit.status],
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
            {visit.date} / {visit.time}
          </p>
        </section>
      </div>
    </InspectionStatusScreen>
  );
}
