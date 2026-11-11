import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { generatePath, Navigate, useNavigate } from 'react-router';
import { savePreventionGuide, type GuideUpdate } from '@/api/preventionGuide';
import { queryKeys } from '@/api/queryClient';
import { Screen } from '@/components/layout';
import { BottomSheet, Button, CheckItem, ProgressBar } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import { tokenStorage } from '@/lib/storage';
import type { GuideItem, GuideResolution, PreventionGuide } from '@/types/domain';
import { GuideLoadingView } from './GuideLoadingPage';
import { GuideLoadState } from './GuideLoadState';
import { useGuideRoute } from './useGuideRoute';

export function GuideView({
  items,
  checked,
  onCheck,
  onBack,
  onResolved,
  onUnresolved,
  initialSheetOpen = false,
  title = '이것부터 확인하세요',
  subtitle = '우리 집 주변을 먼저 살펴보고, 할 수 있는 것부터 준비해 주세요.',
  saving = false,
  saveError,
}: {
  items: GuideItem[];
  checked: string[];
  onCheck: (id: string, value: boolean) => void;
  onBack: () => void;
  onResolved: () => void;
  onUnresolved?: () => void;
  initialSheetOpen?: boolean;
  title?: string;
  subtitle?: string;
  saving?: boolean;
  saveError?: string;
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
          <Button disabled={items.length === 0 || saving} onClick={() => setSheetOpen(true)}>
            가이드대로 해봤어요
          </Button>
        }
      >
        <h1 className="text-title text-ink pt-4">{title}</h1>
        <p className="text-body text-muted mt-2">{subtitle}</p>
        <ProgressBar
          className="mt-7"
          value={count}
          max={items.length}
          label={`${count} / ${items.length} 완료`}
        />
        <fieldset
          className="mt-6 flex min-w-0 flex-col gap-4"
          aria-label="예방 가이드 체크리스트"
          disabled={saving}
        >
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
        </fieldset>
        {saveError && (
          <p role="alert" className="text-body text-danger mt-4">
            {saveError}
          </p>
        )}
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
            닫고 더 해볼게요
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
  const guide = useGuideRoute({ allowGeneration: true });
  const navigate = useNavigate();
  const { assessmentId } = guide;

  if (!assessmentId || !guide.valid) return <Navigate to={PATHS.addressSearch} replace />;

  const onBack = () => navigate(generatePath(PATHS.riskResult, { assessmentId }));
  if (guide.isLoading) return <GuideLoadingView onBack={onBack} />;
  if (!guide.data)
    return <GuideLoadState error={guide.error} retry={guide.retry} onBack={onBack} />;

  return (
    <GuideChecklist
      key={JSON.stringify(guide.queryKey)}
      data={guide.data}
      queryKey={guide.queryKey}
      sessionId={guide.sessionId}
      search={guide.search}
      onBack={onBack}
    />
  );
}

function GuideChecklist({
  data,
  queryKey,
  sessionId,
  search,
  onBack,
}: {
  data: PreventionGuide;
  queryKey: readonly unknown[];
  sessionId?: string | null;
  search: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const locked = useRef(false);
  const query = { queryKey, exact: true };
  const save = useMutation({
    networkMode: 'always',
    retry: false,
    mutationFn: async (update: GuideUpdate) => {
      await client.cancelQueries(query);
      if (tokenStorage.readSession()?.id !== sessionId)
        throw new Error('로그인 상태를 다시 확인해 주세요.');
      if (!env.useMock) return savePreventionGuide(data, update);
      return 'itemId' in update
        ? {
            ...data,
            items: data.items.map((item) =>
              item.id === update.itemId ? { ...item, done: update.completed } : item,
            ),
          }
        : { ...data, resolution: update.resolution };
    },
    onSuccess: async (saved) => {
      if (tokenStorage.readSession()?.id !== sessionId) return;
      await client.cancelQueries(query);
      client.setQueryData(queryKey, saved);
      if (!env.useMock)
        void client.invalidateQueries({
          queryKey: queryKeys.residentProgress(sessionId ?? 'legacy'),
        });
    },
    onError: async () => {
      if (!env.useMock && tokenStorage.readSession()?.id === sessionId)
        await client.invalidateQueries(query);
    },
    onSettled: () => {
      locked.current = false;
    },
  });

  const finish = (resolution: GuideResolution) => {
    if (tokenStorage.readSession()?.id !== sessionId) return;
    if (resolution === 'CONFIRMED') {
      navigate({
        pathname: generatePath(PATHS.guideResolved, { assessmentId: data.assessmentId }),
        search,
      });
    } else {
      navigate({
        pathname: PATHS.inspectionApply,
        search: env.useMock
          ? ''
          : new URLSearchParams({ assessmentId: data.assessmentId }).toString(),
      });
    }
  };

  const choose = (resolution: GuideResolution) => {
    if (locked.current) return;
    if (data.resolution === resolution) {
      finish(resolution);
      return;
    }
    locked.current = true;
    save.mutate({ resolution }, { onSuccess: () => finish(resolution) });
  };

  return (
    <GuideView
      items={data.items}
      title={data.title}
      subtitle={data.subtitle}
      checked={data.items.filter((item) => item.done).map((item) => item.id)}
      saving={save.isPending}
      saveError={save.error?.message}
      onCheck={(itemId, completed) => {
        if (locked.current) return;
        locked.current = true;
        save.mutate({ itemId, completed });
      }}
      onBack={onBack}
      onUnresolved={() => choose('NEEDS_INSPECTION')}
      onResolved={() => choose('CONFIRMED')}
    />
  );
}
