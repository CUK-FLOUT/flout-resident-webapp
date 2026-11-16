import { useEffect, useRef, useState } from 'react';
import { generatePath, Navigate, useLocation, useNavigate } from 'react-router';
import { useInspectionSubmission } from '@/api/applications';
import { Screen } from '@/components/layout';
import { Button, ProgressBar } from '@/components/ui';
import {
  TENURE_LABEL,
  VISIT_TIME_LABEL,
  WATER_ENTRY_OPTIONS,
  YES_NO_UNKNOWN_OPTIONS,
} from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { step1Error, step2Error } from '@/lib/inspection';
import { inspectionSessionScope } from '@/lib/inspectionForm';
import { submitInspection } from '@/lib/inspectionSubmission';
import { useInspectionDraft } from '@/stores/inspectionDraft';

export default function InspectionConfirmPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const applyPath = { pathname: PATHS.inspectionApply, search };
  const schedulePath = { pathname: PATHS.inspectionSchedule, search };
  const submission = useInspectionSubmission();
  const draft = useInspectionDraft();
  const [error, setError] = useState('');
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  if (!draft.context || draft.sessionScope !== inspectionSessionScope())
    return <Navigate to={applyPath} replace />;
  if (step1Error(draft)) return <Navigate to={applyPath} replace />;
  if (step2Error(draft)) return <Navigate to={schedulePath} replace />;
  const context = draft.context;
  const address = context.address;
  const submit = async () => {
    if (useInspectionDraft.getState().submitting) return;
    setError('');
    try {
      await submitInspection(context, submission, (applicationId) => {
        if (active.current)
          navigate(
            generatePath(PATHS.inspectionComplete, { applicationId: String(applicationId) }),
            {
              replace: true,
            },
          );
      });
    } catch (failure) {
      const current = useInspectionDraft.getState();
      if (
        active.current &&
        current.context === context &&
        current.sessionScope === inspectionSessionScope()
      )
        setError(
          failure instanceof Error ? failure.message : '신청하지 못했어요. 다시 시도해 주세요.',
        );
    }
  };
  const applicantRows = [
    ['신청자', draft.applicantName],
    ['연락처', draft.phone],
    ['거주 형태', draft.tenure ? TENURE_LABEL[draft.tenure] : ''],
  ];
  const housingRows = [
    [
      '과거 침수 경험',
      YES_NO_UNKNOWN_OPTIONS.find((v) => v.value === draft.floodExperience)?.label ?? '',
    ],
    [
      '물 유입 위치',
      draft.waterEntryPoints
        .map((v) => WATER_ENTRY_OPTIONS.find((item) => item.value === v)?.label)
        .join(' · ') || '선택하지 않음',
    ],
    ['기존 침수방지시설', draft.facilityInstalled ? '있음' : '없음'],
  ];
  const scheduleRows = [
    ['희망 방문일', draft.preferredDate],
    ['방문 가능 시간', draft.preferredTimeSlot ? VISIT_TIME_LABEL[draft.preferredTimeSlot] : ''],
  ];
  return (
    <Screen
      header={{ title: '신청 정보 확인', onBack: () => navigate(schedulePath) }}
      tab="home"
      bottom={
        <>
          {error && (
            <p role="alert" className="text-body text-danger">
              {error}
            </p>
          )}
          <Button loading={draft.submitting} loadingText="신청 중…" onClick={() => void submit()}>
            신청하기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 pt-4">
        <div>
          <p className="text-caption">최종 확인</p>
          <h1 className="text-title mt-2">
            신청 전에 입력한 내용을
            <br />
            확인해 주세요.
          </h1>
          <ProgressBar className="mt-3" value={3} max={3} label="신청 3 / 3" />
        </div>
        <section>
          <h2 className="text-heading">신청자 정보</h2>
          <dl className="mt-2 flex flex-col gap-2">
            {applicantRows.map(([label, value]) => (
              <div key={label} className="text-body flex justify-between gap-4">
                <dt className="shrink-0">{label}</dt>
                <dd className="text-label min-w-0 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="text-heading">점검 대상 주소</h2>
          <p className="text-section mt-2 font-semibold">{address}</p>
          {context.detailAddress.trim() && (
            <p className="text-body mt-1">{context.detailAddress}</p>
          )}
        </section>
        {[
          { title: '주택 상황', rows: housingRows },
          { title: '방문 가능 일정', rows: scheduleRows },
        ].map(({ title, rows }) => (
          <section key={title}>
            <h2 className="text-heading">{title}</h2>
            <dl className="mt-2 flex flex-col gap-2">
              {rows.map(([label, value]) => (
                <div key={label} className="text-body flex justify-between gap-4">
                  <dt className="shrink-0">{label}</dt>
                  <dd className="text-label min-w-0 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section>
          <h2 className="text-heading">점검 요청 사유</h2>
          <p className="text-body mt-2 whitespace-pre-wrap">{draft.reason.trim() || '없음'}</p>
        </section>
      </div>
    </Screen>
  );
}
