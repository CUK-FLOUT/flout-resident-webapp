import { generatePath, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { resultMock } from './resultMock';

/**
 * Figma: 03-14 현장점검하기_권장 예방조치 (1115:3194)
 * 기능명세: RESULT-05, RESULT-06, RESULT-08
 */
export default function ResultRecommendationsPage() {
  const { applicationId = '000001' } = useParams<'applicationId'>();
  const navigate = useNavigate();
  return (
    <InspectionStatusScreen
      title="권장 예방조치"
      backTo={generatePath(PATHS.resultPoints, { applicationId })}
      bottom={
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate(generatePath(PATHS.support, { applicationId }))}>
            이 점검 결과로 지원 신청
          </Button>
          <Button variant="secondary" onClick={() => navigate(PATHS.home)}>
            홈으로 돌아가기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-5">
        <h2 className="text-title">전문가 권장 예방조치</h2>
        <p className="text-body">
          {applicationId} · 출입구 / 배수구
          <br />
          현장점검에서 등록한 조치를 함께 확인해요.
        </p>
        <ol className="flex flex-col gap-3">
          {resultMock.recommendations.map((recommendation, index) => (
            <li
              key={recommendation}
              className="border-border rounded-md border p-4 text-[16px] leading-[26px] whitespace-pre-line"
            >
              {index + 1}. {recommendation}
            </li>
          ))}
        </ol>
        <p className="text-body text-on-primary">
          공공시설 문제가 확인된 경우 담당 검토로 전달돼요. 개인 주택 지원 신청과 별도로 진행됩니다.
        </p>
      </div>
    </InspectionStatusScreen>
  );
}
