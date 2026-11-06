import { generatePath, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { resultMock } from './resultMock';

/** Figma 03-11 결과 등록 (1565:1446). 기능명세 ID 미확정. */
export default function ResultRegisteredPage() {
  const { applicationId = '000001' } = useParams<'applicationId'>();
  const navigate = useNavigate();

  return (
    <InspectionStatusScreen
      title="현장점검하기"
      backTo={generatePath(PATHS.applicationHub, { applicationId })}
      bottom={
        <Button onClick={() => navigate(generatePath(PATHS.result, { applicationId }))}>
          점검 결과 보기
        </Button>
      }
    >
      <div className="flex flex-col gap-5 py-5">
        <section className="flex flex-col gap-2.5">
          <h2 className="text-title">현장 점검 결과가 등록되었어요.</h2>
          <div className="text-caption flex items-center justify-between gap-3">
            <span>현재 진행 상황</span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="bg-success size-1.5 rounded-full" />
              전체 완료
            </span>
          </div>
        </section>
        <hr className="border-page border-t" />
        <section className="flex flex-col gap-1.5">
          <h3 className="text-section font-semibold">현장점검 신청</h3>
          <p className="text-body">{resultMock.applicationAddress}</p>
          <p className="text-caption">{applicationId} · 신청 접수</p>
        </section>
        <section className="flex flex-col gap-2 pt-[26px]">
          <p className="text-caption">
            우리 집의 침수 취약지점과 전문가 권장 예방조치를 확인해 보세요.
          </p>
          <p className="text-body">
            희망일 {resultMock.preferredVisit}
            <br />
            실제 방문 일정은 담당자 배정 후 확정돼요.
          </p>
        </section>
        <hr className="border-page border-t" />
        <section className="flex flex-col gap-3.5">
          <h3 className="text-caption">전체진행</h3>
          <ol className="flex flex-col gap-5">
            {['현재 단계 · 접수', '방문일정 확정', '전문가 현장점검'].map((label, index) => (
              <li key={label} className="text-label flex items-center gap-3">
                <span aria-hidden className="flex size-6 shrink-0 items-center justify-center">
                  <svg
                    width="19.8"
                    height="19.8"
                    viewBox="0 0 19.8 19.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M18.9 9.9C18.9 14.8706 14.8706 18.9 9.9 18.9C4.92944 18.9 0.9 14.8706 0.9 9.9C0.9 4.92944 4.92944 0.9 9.9 0.9C14.8706 0.9 18.9 4.92944 18.9 9.9Z" />
                    <path
                      d={index === 0 ? 'M4.9 9.9L7.9 12.9L14.9 5.9' : 'M9.9 8.9V14.9M9.9 4.9V5.1'}
                    />
                  </svg>
                </span>
                {label}
              </li>
            ))}
          </ol>
        </section>
        <Button
          variant="secondary"
          className="text-label mt-2 font-medium"
          onClick={() => navigate(generatePath(PATHS.applicationInfo, { applicationId }))}
        >
          신청 정보 확인
        </Button>
      </div>
    </InspectionStatusScreen>
  );
}
