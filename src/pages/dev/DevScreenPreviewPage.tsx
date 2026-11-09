import { useState } from 'react';
import { generatePath, Navigate, useNavigate, useParams } from 'react-router';
import { mockGuide } from '@/api/mocks';
import { Screen } from '@/components/layout';
import { PATHS } from '@/constants/paths';
import { RiskLoadingContent } from '@/pages/risk/RiskLoadingPage';
import { RiskResultView } from '@/pages/risk/RiskResultPage';
import { GuideLoadingView } from '@/pages/guide/GuideLoadingPage';
import { GuideView } from '@/pages/guide/GuidePage';
import { GuideResolvedView } from '@/pages/guide/GuideResolvedPage';
import type { RiskLevel } from '@/types/domain';
import type { ResidenceFloor } from '@/stores/addressDraft';

const previews: Record<string, { level: RiskLevel; floor: ResidenceFloor }> = {
  'risk-high': { level: 'HIGH', floor: 'BASEMENT' },
  'risk-caution': { level: 'CAUTION', floor: 'BASEMENT' },
  'risk-low': { level: 'LOW', floor: 'BASEMENT' },
  'risk-upper': { level: 'LOW', floor: 'SECOND_OR_ABOVE' },
};

export default function DevScreenPreviewPage() {
  const { screen } = useParams();
  const navigate = useNavigate();
  const [checked, setChecked] = useState<string[]>(['gi-1', 'gi-2']);
  const goBack = () => navigate(PATHS.devScreens);

  if (screen === 'guide-loading') return <GuideLoadingView onBack={goBack} />;
  if (screen === 'guide-list' || screen === 'guide-sheet')
    return (
      <GuideView
        key={screen}
        items={mockGuide.items}
        checked={checked}
        onCheck={(id, value) =>
          setChecked((current) =>
            value ? [...new Set([...current, id])] : current.filter((item) => item !== id),
          )
        }
        onBack={goBack}
        onResolved={() =>
          navigate(generatePath(PATHS.devScreenPreview, { screen: 'guide-resolved' }))
        }
        initialSheetOpen={screen === 'guide-sheet'}
      />
    );
  if (screen === 'guide-resolved')
    return (
      <GuideResolvedView
        address="부천시 ○○구 ○○로 00"
        risk="낮음"
        count={4}
        total={4}
        onGuide={() => navigate(generatePath(PATHS.devScreenPreview, { screen: 'guide-list' }))}
        onHome={goBack}
      />
    );

  if (screen === 'risk-loading') {
    return (
      <Screen
        header={{
          title: '취약도 분석',
          onBack: goBack,
          className: 'px-5 [&_h1]:text-[18px] [&_svg]:size-6',
        }}
        tab="home"
      >
        <RiskLoadingContent />
      </Screen>
    );
  }

  const preview = screen ? previews[screen] : undefined;
  if (!preview) return <Navigate to={PATHS.devScreens} replace />;
  return (
    <RiskResultView
      address="경기도 부천시 원미구 부천로 00"
      detail="101동 302호"
      floor={preview.floor}
      level={preview.level}
      onBack={goBack}
    />
  );
}
