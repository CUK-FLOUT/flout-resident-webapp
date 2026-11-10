import { useEffect, useRef, useState } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, ChoiceGroup, ProgressBar, Textarea, TextField } from '@/components/ui';
import { TENURE_OPTIONS, WATER_ENTRY_OPTIONS, YES_NO_UNKNOWN_OPTIONS } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import {
  formatInspectionPhone,
  inspectionPhoneError,
  PHONE_TOO_LONG_MESSAGE,
  step1Error,
} from '@/lib/inspection';
import { useAddressDraft } from '@/stores/addressDraft';
import { useInspectionDraft } from '@/stores/inspectionDraft';
import type { WaterEntryPoint } from '@/types/domain';
import {
  forgetInspection,
  inspectionFormFields,
  inspectionSessionScope,
  loadInspectionEntry,
  rememberInspection,
  saveInspectionProgress,
} from '@/lib/inspectionForm';
import { useInspectionAutosave } from './useInspectionAutosave';

export default function InspectionApplyPage() {
  const navigate = useNavigate();
  const draft = useInspectionDraft();
  const { result } = useAddressDraft();
  const requestedApplicationId = useLocation().state?.applicationId as number | undefined;
  const scope = inspectionSessionScope();
  const [error, setError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const advancing = useRef(false);
  const ready = Boolean(
    draft.context &&
    draft.sessionScope === scope &&
    (requestedApplicationId
      ? draft.savedApplicationId === requestedApplicationId
      : !result || draft.assessmentId === result.id),
  );
  useEffect(() => {
    if (ready) return;
    let active = true;
    void loadInspectionEntry(result, scope, requestedApplicationId)
      .then((entry) => {
        if (!active || !entry || scope !== inspectionSessionScope()) return;
        const store = useInspectionDraft.getState();
        store.reset();
        if ('completed' in entry) {
          if (entry.assessmentId !== undefined) forgetInspection(entry.assessmentId);
          navigate(
            generatePath(PATHS.inspectionComplete, { applicationId: String(entry.completed) }),
            {
              replace: true,
            },
          );
          return;
        }
        store.update(entry.draft);
        const restored = useInspectionDraft.getState();
        const snapshot = JSON.stringify(inspectionFormFields(restored));
        store.update({
          formSnapshot: snapshot,
          savedPayload: restored.savedApplicationId ? snapshot : '',
        });
        if (typeof restored.assessmentId === 'number')
          rememberInspection(
            restored.assessmentId,
            restored.savedApplicationId,
            restored.uploadKey,
          );
      })
      .catch((failure: unknown) => {
        if (active)
          setError(
            failure instanceof Error ? failure.message : '임시 저장 정보를 불러오지 못했어요.',
          );
      });
    return () => {
      active = false;
    };
  }, [ready, result, scope, requestedApplicationId, navigate]);
  useInspectionAutosave(draft, ready, setError);
  if (!ready)
    return (
      <Screen
        header={{ title: '현장점검하기' }}
        tab="home"
        bottom={<Button onClick={() => navigate(PATHS.addressSearch)}>주소 검색하기</Button>}
      >
        <p className="text-body text-muted pt-10 text-center">
          {error || '먼저 주소를 검색하고 침수 취약도를 확인해 주세요.'}
        </p>
      </Screen>
    );
  return (
    <Screen
      header={{ title: '현장점검하기' }}
      tab="home"
      bottom={
        <Button
          variant={step1Error(draft) ? 'muted' : 'primary'}
          onClick={async () => {
            if (advancing.current || draft.submitting) return;
            const message = step1Error(draft);
            setPhoneTouched(true);
            setError(
              message && message === inspectionPhoneError(draft.phone) ? '' : (message ?? ''),
            );
            if (message) return;
            advancing.current = true;
            try {
              await saveInspectionProgress();
              if (
                useInspectionDraft.getState().context === draft.context &&
                scope === inspectionSessionScope()
              )
                navigate(PATHS.inspectionSchedule);
            } catch (failure) {
              setError(
                failure instanceof Error ? failure.message : '신청서를 임시 저장하지 못했어요.',
              );
            } finally {
              advancing.current = false;
            }
          }}
        >
          다음
        </Button>
      }
    >
      <div className="flex flex-col gap-5 pt-4">
        <div>
          <p className="text-caption">주택 상황</p>
          <h1 className="text-title mt-2">집 상태를 알려주세요.</h1>
          <p className="text-body mt-2">현장점검을 위한 정보예요.</p>
          <ProgressBar className="mt-3" value={1} max={3} label="신청 1 / 3" />
        </div>
        <h2 className="text-label text-center">신청자 정보 확인</h2>
        <div className="grid grid-cols-2 gap-2">
          <TextField
            size="md"
            label="신청자 · 필수"
            value={draft.applicantName}
            maxLength={50}
            onChange={(e) => draft.update({ applicantName: e.target.value })}
          />
          <TextField
            size="md"
            label="연락처 · 필수"
            type="tel"
            inputMode="tel"
            value={draft.phone}
            errorText={
              phoneTouched || inspectionPhoneError(draft.phone) === PHONE_TOO_LONG_MESSAGE
                ? (inspectionPhoneError(draft.phone) ?? undefined)
                : undefined
            }
            onBlur={() => setPhoneTouched(true)}
            onChange={(e) => {
              draft.update({ phone: formatInspectionPhone(e.target.value) });
              if (error === '연락처를 입력해 주세요.') setError('');
            }}
          />
        </div>
        <ChoiceGroup
          className="[&>p]:text-label"
          label="거주 형태 · 필수"
          options={TENURE_OPTIONS}
          value={draft.tenure}
          onChange={(tenure) => draft.update({ tenure })}
        />
        <ChoiceGroup
          className="[&>p]:text-label"
          label="과거 침수 경험이 있나요? · 필수"
          options={YES_NO_UNKNOWN_OPTIONS}
          value={draft.floodExperience}
          onChange={(floodExperience) => draft.update({ floodExperience })}
        />
        <ChoiceGroup<WaterEntryPoint>
          className="[&>p]:text-label"
          label="물이 들어온 곳 · 여러 곳 선택 가능"
          options={WATER_ENTRY_OPTIONS}
          columns={2}
          multiple
          value={draft.waterEntryPoints}
          onChange={(waterEntryPoints) => {
            if (waterEntryPoints.includes('UNKNOWN')) {
              waterEntryPoints = draft.waterEntryPoints.includes('UNKNOWN')
                ? waterEntryPoints.filter((point) => point !== 'UNKNOWN')
                : ['UNKNOWN'];
            }
            draft.update({ waterEntryPoints });
          }}
        />
        <ChoiceGroup
          className="[&>p]:text-label"
          label="기존 침수방지시설 · 필수"
          options={
            [
              { value: 'YES', label: '있음' },
              { value: 'NO', label: '없음' },
            ] as const
          }
          columns={2}
          value={draft.facilityInstalled === null ? null : draft.facilityInstalled ? 'YES' : 'NO'}
          onChange={(value) => draft.update({ facilityInstalled: value === 'YES' })}
        />
        <Textarea
          label="점검 요청 사유 · 선택"
          rows={2}
          maxLength={2000}
          value={draft.reason}
          onChange={(e) => draft.update({ reason: e.target.value })}
        />
        {error && (
          <p role="alert" className="text-body text-danger">
            {error}
          </p>
        )}
      </div>
    </Screen>
  );
}
