import { generatePath, useNavigate, useParams } from 'react-router';
import receivedIcon from '@/assets/inspection/status-received.svg';
import completeIcon from '@/assets/inspection/step-complete.svg';
import pendingIcon from '@/assets/inspection/step-pending.svg';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { inspectionStatusMock as inspection } from '@/pages/inspection/inspectionStatusMock';

const steps = ['현재 단계 · 접수', '방문일정 확정', '전문가 현장점검'];

export default function ApplicationHubPage() {
  const navigate = useNavigate();
  const { applicationId = inspection.receiptNumber } = useParams<'applicationId'>();

  return (
    <InspectionStatusScreen
      title="현장점검하기"
      backTo={PATHS.home}
      bottom={
        <Button onClick={() => navigate(generatePath(PATHS.applicationInfo, { applicationId }))}>
          점검 신청 내역 보기
        </Button>
      }
    >
      <div className="flex flex-col gap-5 pt-5 pb-5">
        <section className="flex flex-col gap-2.5">
          <h2 className="text-title text-primary">신청이 접수되었어요.</h2>
          <p className="text-body text-muted">방문 일정을 확인하고 있어요.</p>
          <div className="flex items-center justify-between">
            <span className="text-muted text-[12px] leading-[18px] font-medium">
              현재 진행 상황
            </span>
            <span className="text-caption flex items-center gap-2">
              <img src={receivedIcon} alt="" />
              {inspection.status}
            </span>
          </div>
        </section>
        <hr className="border-page border-t" />
        <section className="flex flex-col gap-1.5">
          <h3 className="text-section font-semibold">현장점검 신청</h3>
          <p className="text-body text-muted">{inspection.address}</p>
          <p className="text-muted text-[12px] leading-[18px]">
            {inspection.receiptNumber} · 신청 접수
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-label">다음 할 일</h3>
          <p className="text-muted text-[13px] leading-[22px]">
            희망일 {inspection.preferredDate} · {inspection.preferredTime}
            <br />
            실제 방문 일정은 담당자 배정 후 확정돼요.
          </p>
        </section>
        <hr className="border-page border-t" />
        <section className="flex flex-col gap-3.5">
          <h3 className="text-label">전체진행</h3>
          <ol aria-label="전체 진행 과정" className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <li
                key={step}
                aria-current={index === 0 ? 'step' : undefined}
                className="flex items-center gap-3"
              >
                <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
                  <img src={index === 0 ? completeIcon : pendingIcon} alt="" />
                </span>
                <span
                  className={`text-[14px] leading-6 ${index === 0 ? 'text-primary font-semibold' : 'text-muted'}`}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </InspectionStatusScreen>
  );
}
