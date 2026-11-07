import { generatePath, Link, useNavigate } from 'react-router';
import receivedIcon from '@/assets/inspection/status-received.svg';
import completeIcon from '@/assets/inspection/step-complete.svg';
import pendingIcon from '@/assets/inspection/step-pending.svg';
import { Button } from '@/components/ui';
import { APPLICATION_STAGE } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { formatDate } from '@/lib/date';
import {
  getInspectionAddress,
  getInspectionStage,
  getInspectionStatusLabel,
  getPreferredVisitTime,
  getVisitDateTime,
} from '@/lib/inspectionApplication';
import { InspectionApplicationScreen } from './InspectionApplicationScreen';

const steps = ['접수', '방문일정 확정', '전문가 현장점검'];
const stepByStatus = { RECEIVED: 0, SCHEDULED: 1, IN_PROGRESS: 2, COMPLETED: 3 };

export default function ApplicationHubPage() {
  const navigate = useNavigate();

  return (
    <InspectionApplicationScreen
      title="현장점검하기"
      backTo="home"
      bottom={(detail) => (
        <Button
          onClick={() =>
            navigate(
              generatePath(PATHS.applicationInfo, { applicationId: String(detail.applicationId) }),
            )
          }
        >
          점검 신청 내역 보기
        </Button>
      )}
    >
      {(detail) => {
        const stage = getInspectionStage(detail);
        const status = getInspectionStatusLabel(detail);
        const scheduled = detail.inspectionStatus === 'SCHEDULED';
        const inProgress = detail.inspectionStatus === 'IN_PROGRESS';
        const visit = getVisitDateTime(detail.progress?.visit?.scheduledAt);
        const inspectionStatus =
          detail.inspectionStatus ??
          (detail.applicationStatus === 'INSPECTION_COMPLETED' ? 'COMPLETED' : 'RECEIVED');
        const currentStep =
          detail.applicationStatus === 'DRAFT' ? -1 : stepByStatus[inspectionStatus];
        const nextPath = scheduled
          ? PATHS.visit
          : inProgress
            ? PATHS.inspectionProgress
            : undefined;
        return (
          <div className="flex flex-col gap-5 pt-5 pb-5">
            <section className="flex flex-col gap-2.5">
              <h2 className="text-title text-primary">
                {stage === 'INSPECTION_RECEIVED' ? '신청이 접수되었어요.' : status}
              </h2>
              <p className="text-body text-muted">
                {scheduled && !visit
                  ? '확정 방문 시간을 확인하고 있어요.'
                  : stage
                    ? APPLICATION_STAGE[stage]?.headline
                    : '사진 등록이 완료되면 접수돼요.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-muted text-[12px] leading-[18px] font-medium">
                  현재 진행 상황
                </span>
                <span className="text-caption flex items-center gap-2">
                  <img src={receivedIcon} alt="" />
                  {status}
                </span>
              </div>
            </section>
            <hr className="border-page border-t" />
            <section className="flex flex-col gap-1.5">
              <h3 className="text-section font-semibold">현장점검 신청</h3>
              <p className="text-body text-muted">{getInspectionAddress(detail)}</p>
              <p className="text-muted text-[12px] leading-[18px]">
                {detail.receiptNumber} · {status}
              </p>
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="text-label">다음 할 일</h3>
              <p className="text-muted text-[13px] leading-[22px]">
                {scheduled ? (
                  visit ? (
                    `확정 일정 ${visit.date} · ${visit.timeLabel}`
                  ) : (
                    '확정 방문 일정 미정'
                  )
                ) : currentStep === 0 ? (
                  <>
                    희망일{' '}
                    {detail.preferredVisitDate ? formatDate(detail.preferredVisitDate) : '미정'} ·{' '}
                    {getPreferredVisitTime(detail.preferredTimeSlot)}
                    <br />
                    실제 방문 일정은 담당자 배정 후 확정돼요.
                  </>
                ) : stage ? (
                  APPLICATION_STAGE[stage]?.headline
                ) : (
                  '신청 정보를 확인해 주세요.'
                )}
              </p>
              {nextPath && (
                <Link
                  to={generatePath(nextPath, { applicationId: String(detail.applicationId) })}
                  className="text-caption text-primary font-semibold underline"
                >
                  {scheduled ? '방문 일정 보기' : '점검 진행 상태 보기'}
                </Link>
              )}
            </section>
            <hr className="border-page border-t" />
            <section className="flex flex-col gap-3.5">
              <h3 className="text-label">전체진행</h3>
              <ol aria-label="전체 진행 과정" className="flex flex-col gap-4">
                {steps.map((step, index) => (
                  <li
                    key={index === currentStep ? `현재 단계 · ${step}` : step}
                    aria-current={index === currentStep ? 'step' : undefined}
                    className="flex items-center gap-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
                      <img src={index <= currentStep ? completeIcon : pendingIcon} alt="" />
                    </span>
                    <span
                      className={`text-[14px] leading-6 ${index === currentStep ? 'text-primary font-semibold' : 'text-muted'}`}
                    >
                      {index === currentStep ? `현재 단계 · ${step}` : step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        );
      }}
    </InspectionApplicationScreen>
  );
}
