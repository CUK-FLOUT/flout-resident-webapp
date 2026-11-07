import { generatePath, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { resultMock } from './resultMock';

export default function ResultSummaryPage() {
  const { applicationId = '000001' } = useParams<'applicationId'>();
  const navigate = useNavigate();
  return (
    <InspectionStatusScreen
      title="점검 결과 보기"
      backTo={generatePath(PATHS.resultRegistered, { applicationId })}
      bottom={
        <Button onClick={() => navigate(generatePath(PATHS.resultPoints, { applicationId }))}>
          취약점 자세히 보기
        </Button>
      }
    >
      <div className="flex flex-col gap-3 py-5">
        <p className="text-success text-[12px] leading-[18px] font-medium">전문가 현장점검 완료</p>
        <h2 className="text-title">
          집에서 확인된
          <br />
          취약 지점을 알려드릴게요.
        </h2>
        <p className="text-muted text-[13px] leading-[22px]">
          {applicationId} · {resultMock.applicant} · {resultMock.address}
          <br />
          현장점검 결과를 바탕으로 정리했어요.
        </p>
        <section className="pt-3">
          <h3 className="text-caption text-muted font-medium">
            확인된 취약지점 · {resultMock.points.length}곳
          </h3>
          <ol>
            {resultMock.points.map((point, index) => (
              <li
                key={point.location}
                className="flex min-h-12 items-center text-[15px] leading-6 font-medium"
              >
                <span className="w-8 shrink-0">{String(index + 1).padStart(2, '0')}</span>
                {point.location}
              </li>
            ))}
          </ol>
        </section>
        <hr className="border-border border-t" />
        <section className="flex flex-col gap-2 pt-1">
          <h3 className="text-heading font-semibold">전문가 의견</h3>
          <p className="text-[14px] leading-6">{resultMock.summary}</p>
        </section>
        <section className="text-muted flex flex-col gap-1 pt-2">
          <h3 className="text-[12px] leading-[18px]">공개 상태</h3>
          <p className="text-[13px] leading-[22px]">점검 완료 · 주민에게 결과 공개</p>
        </section>
      </div>
    </InspectionStatusScreen>
  );
}
