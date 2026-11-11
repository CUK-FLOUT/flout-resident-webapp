import { generatePath, useNavigate } from 'react-router';
import { useInspectionRecommendations } from '@/api/inspectionResults';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import {
  ResultApplicationScreen,
  ResultState,
  type ResultApplication,
} from './ResultApplicationScreen';

export default function ResultRecommendationsPage() {
  return (
    <ResultApplicationScreen title="권장 예방조치" backTo="resultPoints">
      {(props) => <ResultRecommendations {...props} />}
    </ResultApplicationScreen>
  );
}

function ResultRecommendations({ title, backTo, application, applicationId }: ResultApplication) {
  const navigate = useNavigate();
  const recommendations = useInspectionRecommendations(application.applicationId);
  if (recommendations.isPending)
    return <ResultState title={title} backTo={backTo} message="권장 예방조치를 불러오고 있어요…" />;
  if (recommendations.isError || !recommendations.data)
    return (
      <ResultState
        title={title}
        backTo={backTo}
        message="권장 예방조치를 불러오지 못했어요."
        retry={() => void recommendations.refetch()}
      />
    );
  const { recommendedActions } = recommendations.data;
  return (
    <InspectionStatusScreen
      title={title}
      backTo={backTo}
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
          {application.receiptNumber}
          <br />
          현장점검에서 등록한 조치를 함께 확인해요.
        </p>
        {recommendedActions.length === 0 ? (
          <p className="text-body text-muted">등록된 권장 예방조치가 없어요.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {recommendedActions.map(({ description }, index) => (
              <li
                key={index}
                className="border-border rounded-md border p-4 text-[16px] leading-[26px] whitespace-pre-line"
              >
                {index + 1}. {description}
              </li>
            ))}
          </ol>
        )}
      </div>
    </InspectionStatusScreen>
  );
}
