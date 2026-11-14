import { generatePath, useNavigate } from 'react-router';
import { useRecommendedFacilities } from '@/api/applications';
import { useInspectionRecommendations } from '@/api/inspectionResults';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { ApiError } from '@/lib/http';
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
  const facilities = useRecommendedFacilities(applicationId);
  const unpublished = [recommendations.error, facilities.error].some(
    (error) => error instanceof ApiError && error.code === 'APPLICATION_400_5',
  );
  if (unpublished)
    return (
      <ResultState title={title} backTo={backTo} message="아직 점검 결과가 공개되지 않았어요." />
    );
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
  if (facilities.isPending)
    return (
      <ResultState title={title} backTo={backTo} message="권장 설치 시설을 확인하고 있어요…" />
    );
  if (facilities.isError || !facilities.data)
    return (
      <ResultState
        title={title}
        backTo={backTo}
        message="권장 설치 시설을 불러오지 못했어요."
        retry={() => void facilities.refetch()}
      />
    );
  const { recommendedActions } = recommendations.data;
  const hasFacilities = facilities.data.facilities.length > 0;
  return (
    <InspectionStatusScreen
      title={title}
      backTo={backTo}
      bottom={
        <div className="flex flex-col gap-2">
          <div className="text-caption text-muted">
            {hasFacilities ? (
              <>
                <p>권장 예방조치와 관련된 지원사업을 확인할 수 있어요.</p>
                <p>실제 지원 가능 여부는 사업별 조건에 따라 달라질 수 있어요.</p>
              </>
            ) : (
              <>
                <p>권장 예방조치에서 설치할 시설이 확인되지 않았어요.</p>
                <p>관련 사업 알아보기는 이용할 수 없어요.</p>
              </>
            )}
          </div>
          <Button
            className="rounded-[5px] text-[13px]"
            disabled={!hasFacilities}
            onClick={() => navigate(generatePath(PATHS.support, { applicationId }))}
          >
            관련 사업 알아보기
          </Button>
          <Button
            className="rounded-[5px] text-[13px]"
            variant={hasFacilities ? 'secondary' : 'primary'}
            onClick={() => navigate(PATHS.home)}
          >
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
