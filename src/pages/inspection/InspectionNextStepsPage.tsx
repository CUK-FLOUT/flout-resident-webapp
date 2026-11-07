import { generatePath, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from './InspectionStatusScreen';

const steps = ['현재 단계 · 신청 접수', '방문일정 확정', '전문가 현장점검', '점검 결과 확인'];

export default function InspectionNextStepsPage() {
  const navigate = useNavigate();
  const { applicationId = '000001' } = useParams<'applicationId'>();

  return (
    <InspectionStatusScreen
      title="진행 절차"
      backTo={generatePath(PATHS.inspectionComplete, { applicationId })}
      bottom={
        <Button variant="secondary" onClick={() => navigate(PATHS.home)}>
          홈으로 가기
        </Button>
      }
    >
      <section className="flex flex-col gap-2 py-4">
        <p className="text-muted text-[12px] leading-[18px] font-medium">현장 점검 신청 이후</p>
        <h2 className="text-title">앞으로 이렇게 진행돼요.</h2>
        <p className="text-body text-muted">
          신청 내용을 확인하고 방문 일정을 배정한 뒤<br />
          전문가가 주택을 점검해요.
        </p>
      </section>
      <ol aria-label="신청 이후 진행 단계" className="pt-2 pb-6">
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={index === 0 ? 'step' : undefined}
            className="relative flex min-h-13 items-center gap-3 py-3"
          >
            {index < steps.length - 1 && (
              <span aria-hidden className="bg-border absolute top-9 left-[11.5px] h-7 w-px" />
            )}
            <span
              aria-hidden
              className={`relative flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] leading-[22px] font-bold ${index === 0 ? 'bg-primary text-on-primary' : 'border-border text-muted bg-surface border'}`}
            >
              {index + 1}
            </span>
            <span
              className={`text-[15px] leading-6 ${index === 0 ? 'text-primary font-semibold' : 'text-ink'}`}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
      <section className="border-border flex flex-col gap-2 border-t pt-[18px]">
        <h3 className="text-body font-semibold">방문 일정은 담당자 배정 후 확정돼요.</h3>
        <p className="text-muted text-[13px] leading-[22px]">
          신청 시 선택한 방문 가능 시간은 참고정보이며, 실제 방문 날짜와 시간은 담당자 조율 후
          확정됩니다
        </p>
      </section>
      <p className="text-caption text-muted pt-4 font-medium">진행상태는 내 신청에서 확인해요.</p>
    </InspectionStatusScreen>
  );
}
