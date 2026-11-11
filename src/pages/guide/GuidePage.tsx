import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { generatePath, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { useGuide } from '@/api/risk';
import { Screen } from '@/components/layout';
import { BottomSheet, Button, CheckItem, ProgressBar } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { useAddressDraft } from '@/stores/addressDraft';
import { useGuideProgress } from '@/stores/guideProgress';
import type { GuideItem } from '@/types/domain';

export function GuideView({
  items,
  checked,
  onCheck,
  onBack,
  onResolved,
  onUnresolved,
  initialSheetOpen = false,
}: {
  items: GuideItem[];
  checked: string[];
  onCheck: (id: string, value: boolean) => void;
  onBack: () => void;
  onResolved: () => void;
  onUnresolved?: () => void;
  initialSheetOpen?: boolean;
}) {
  const [sheetOpen, setSheetOpen] = useState(initialSheetOpen);
  const [unresolved, setUnresolved] = useState(false);
  const count = items.filter((item) => checked.includes(item.id)).length;
  return (
    <>
      <Screen
        header={{ title: '맞춤 예방 가이드', onBack }}
        tab="home"
        bottom={
          <Button disabled={items.length === 0} onClick={() => setSheetOpen(true)}>
            가이드대로 해봤어요
          </Button>
        }
      >
        <h1 className="text-title text-ink pt-4">이것부터 확인하세요</h1>
        <p className="text-body text-muted mt-2">
          우리 집 주변을 먼저 살펴보고, 할 수 있는 것부터 준비해 주세요.
        </p>
        <ProgressBar
          className="mt-7"
          value={count}
          max={items.length}
          label={`${count} / ${items.length} 완료`}
        />
        <div className="mt-6 flex flex-col gap-4">
          {items.map((item) => {
            const done = checked.includes(item.id);
            return (
              <CheckItem
                key={item.id}
                variant="checklist"
                checked={done}
                onChange={(value) => onCheck(item.id, value)}
                title={item.title}
                description={item.description}
                meta={`${done ? '✓ 완료' : '미완료'}${item.estimatedMinutes === undefined ? '' : ` · 예상 ${item.estimatedMinutes}분`}`}
              />
            );
          })}
        </div>
        {items.length === 0 && (
          <p className="text-body text-muted mt-6">표시할 예방 가이드가 없어요.</p>
        )}
        <p className="text-caption text-muted mt-6">
          침수 예방을 위한 권장 사항이에요. 집 구조에 따라 실제 상황과 다를 수 있어요. 위험한 작업은
          직접 하지 말고 도움을 요청해 주세요.
        </p>
        {unresolved && (
          <p role="status" className="text-body text-muted mt-4">
            현장점검 신청 기능은 준비 중이에요. 가이드를 계속 확인할 수 있어요.
          </p>
        )}
      </Screen>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="문제가 해결되었나요?"
        description="가이드를 따라 해보셨다면 알려 주세요."
        footer={
          <Button variant="text" size="md" onClick={() => setSheetOpen(false)}>
            진행 중인 가이드로 돌아가기
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <button
            type="button"
            className="border-border flex w-full items-center justify-between rounded-md border p-4 text-left"
            onClick={() => {
              setSheetOpen(false);
              onResolved();
            }}
          >
            <span>
              <span className="text-section text-ink block">해결했어요</span>
              <span className="text-caption text-muted block">여기서 마칠게요</span>
            </span>
            <ChevronRight className="text-primary" size={20} aria-hidden />
          </button>
          <button
            type="button"
            className="border-border flex w-full items-center justify-between rounded-md border p-4 text-left"
            onClick={() => {
              setSheetOpen(false);
              if (onUnresolved) onUnresolved();
              else setUnresolved(true);
            }}
          >
            <span>
              <span className="text-section text-ink block">아직 해결이 안 됐어요</span>
              <span className="text-caption text-muted block">현장점검을 신청할래요</span>
            </span>
            <ChevronRight className="text-primary" size={20} aria-hidden />
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

export default function GuidePage() {
  const { assessmentId } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const result = useAddressDraft((s) => s.result);
  const valid = Boolean(assessmentId && result && String(result.id) === assessmentId);
  const guide = useGuide(valid ? assessmentId : undefined);
  const allCompleted = useGuideProgress((s) => s.completed);
  const setChecked = useGuideProgress((s) => s.setChecked);
  const setResolved = useGuideProgress((s) => s.setResolved);
  if (!valid || !assessmentId)
    return assessmentId && new URLSearchParams(search).has('guideId') ? (
      <Navigate
        to={{ pathname: generatePath(PATHS.guideLoading, { assessmentId }), search }}
        replace
      />
    ) : (
      <Navigate to={PATHS.addressSearch} replace />
    );
  if (guide.isLoading)
    return <Navigate to={generatePath(PATHS.guideLoading, { assessmentId })} replace />;
  if (!guide.data)
    return (
      <Screen
        header={{ title: '맞춤 예방 가이드' }}
        tab="home"
        bottom={<Button onClick={() => void guide.refetch()}>다시 시도</Button>}
      >
        <p role="alert" className="text-body text-muted pt-10 text-center">
          가이드를 불러오지 못했어요.
        </p>
      </Screen>
    );
  const initial = guide.data.items.filter((item) => item.done).map((item) => item.id);
  return (
    <GuideView
      items={guide.data.items}
      checked={allCompleted[assessmentId] ?? initial}
      onCheck={(id, value) => setChecked(assessmentId, id, value, initial)}
      onBack={() => navigate(generatePath(PATHS.riskResult, { assessmentId }))}
      onUnresolved={() => {
        setResolved(assessmentId, false);
        navigate(PATHS.inspectionApply);
      }}
      onResolved={() => {
        setResolved(assessmentId, true);
        navigate(generatePath(PATHS.guideResolved, { assessmentId }));
      }}
    />
  );
}
