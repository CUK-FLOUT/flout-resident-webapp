import { Navigate, useNavigate, useParams } from 'react-router';
import { Screen } from '@/components/layout';
import { PATHS } from '@/constants/paths';
import { RiskLoadingContent } from '@/pages/risk/RiskLoadingPage';
import { RiskResultView } from '@/pages/risk/RiskResultPage';
import type { MockRiskLevel } from '@/api/riskAnalysis';
import type { ResidenceFloor } from '@/stores/addressDraft';

const previews: Record<string, { level: MockRiskLevel; floor: ResidenceFloor }> = {
  'risk-high': { level: 'HIGH', floor: 'BASEMENT' },
  'risk-caution': { level: 'CAUTION', floor: 'BASEMENT' },
  'risk-low': { level: 'LOW', floor: 'BASEMENT' },
  'risk-upper': { level: 'LOW', floor: 'SECOND_OR_ABOVE' },
};

const address = {
  roadAddress: '경기도 부천시 원미구 부천로 00',
  jibunAddress: '경기도 부천시 원미구 심곡동 000-0',
  buildingName: '',
  zipCode: '14600',
};

export default function DevScreenPreviewPage() {
  const { screen } = useParams();
  const navigate = useNavigate();
  const goBack = () => navigate(PATHS.devScreens);

  if (screen === 'risk-loading') {
    return (
      <Screen header={{ title: '취약도 분석', onBack: goBack }} tab="home">
        <div className="flex flex-col items-center gap-5 pt-14 text-center" role="status">
          <RiskLoadingContent />
        </div>
      </Screen>
    );
  }

  const preview = screen ? previews[screen] : undefined;
  if (!preview) return <Navigate to={PATHS.devScreens} replace />;
  return (
    <RiskResultView
      address={address}
      detail="101동 302호"
      floor={preview.floor}
      level={preview.level}
      onBack={goBack}
    />
  );
}
