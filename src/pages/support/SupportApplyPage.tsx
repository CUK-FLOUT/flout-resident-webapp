import { useEffect, useRef, useState } from 'react';
import { generatePath, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import {
  useInspectionApplication,
  useRecommendedFacilities,
  useSupportPrograms,
} from '@/api/applications';
import {
  listSupportFormDrafts,
  putSupportFormDraft,
  type SupportFormDraft,
} from '@/api/supportFormDrafts';
import radioChecked from '@/assets/support/radio-checked.svg';
import radioUnchecked from '@/assets/support/radio-unchecked.svg';
import { Screen, StateMessage } from '@/components/layout';
import { Button, ChoiceGroup, TextField } from '@/components/ui';
import { TENURE_LABEL, VISIT_TIME_OPTIONS } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import { maskPhone } from '@/lib/phone';
import { useSupportDraft } from '@/stores/supportDraft';
import type { InspectionApplicationDetail, SupportProgram, VisitTimeSlot } from '@/types/domain';

export default function SupportApplyPage() {
  const { applicationId } = useParams<'applicationId'>();
  const [searchParams] = useSearchParams();
  const requestedDraftId = searchParams.get('supportFormDraftId');
  return (
    <SupportApplyEntry
      key={JSON.stringify([applicationId, requestedDraftId])}
      applicationId={applicationId}
      requestedDraftId={requestedDraftId}
    />
  );
}

function SupportApplyEntry({
  applicationId,
  requestedDraftId,
}: {
  applicationId?: string;
  requestedDraftId: string | null;
}) {
  const application = useInspectionApplication(applicationId);
  const programs = useSupportPrograms(applicationId);
  const recommended = useRecommendedFacilities(applicationId);
  const header = { title: '지원하기' };
  const queries = [application, programs, recommended];
  const program = programs.data?.[0];
  const [resume, setResume] = useState<SupportFormDraft | null | undefined>(
    env.useMock ? null : undefined,
  );
  const [attempt, setAttempt] = useState(0);
  const [resumeError, setResumeError] = useState(false);

  useEffect(() => {
    if (env.useMock || !applicationId) return;
    let alive = true;
    listSupportFormDrafts()
      .then((drafts) => {
        if (!alive) return;
        setResume(
          drafts.find((draft) =>
            requestedDraftId === null
              ? String(draft.applicationId) === applicationId
              : draft.applicationId === Number(applicationId) &&
                draft.draftId === requestedDraftId &&
                draft.formState === 'EDITING' &&
                draft.supportApplicationId === null,
          ) ?? null,
        );
      })
      .catch(() => {
        if (!alive) return;
        setResume(null);
        setResumeError(true);
      });
    return () => {
      alive = false;
    };
  }, [applicationId, requestedDraftId, attempt]);

  if (queries.some((q) => q.isLoading) || resume === undefined) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>신청 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (resumeError || (requestedDraftId !== null && !resume)) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          resumeError && (
            <Button
              onClick={() => {
                setResumeError(false);
                setResume(undefined);
                setAttempt((value) => value + 1);
              }}
            >
              다시 시도
            </Button>
          )
        }
      >
        <StateMessage>
          {resumeError
            ? '임시 저장 정보를 불러오지 못했어요.'
            : '이어서 작성할 지원 신청서를 찾을 수 없어요.'}
        </StateMessage>
      </Screen>
    );
  }

  if (!application.data || !program || !recommended.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          <Button onClick={() => queries.forEach((q) => q.isError && q.refetch())}>
            다시 시도
          </Button>
        }
      >
        <StateMessage>신청 정보를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const savedProgramId = resume?.fields.programId;
  const programId = Number(program.id);
  if (
    !Number.isSafeInteger(programId) ||
    programId <= 0 ||
    (resume && savedProgramId !== programId) ||
    (requestedDraftId !== null && recommended.data.facilities.length === 0)
  ) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>이 신청서에 연결된 지원사업 또는 권장 시설을 확인할 수 없어요.</StateMessage>
      </Screen>
    );
  }

  if (recommended.data.facilities.length === 0) {
    return <Navigate to={generatePath(PATHS.support, { applicationId: applicationId! })} replace />;
  }

  return (
    <ApplyForm
      applicationId={applicationId!}
      application={application.data}
      program={program}
      programId={programId}
      facilityOptions={recommended.data.facilities}
      resume={resume}
      resumeFromHome={requestedDraftId !== null}
    />
  );
}

function restoreFields(resume: SupportFormDraft | null, facilityOptions: string[]) {
  const fields = resume?.fields ?? {};
  const { requestedFacility, preferredVisitDate, preferredVisitTime } = fields;
  const today = new Date().toLocaleDateString('sv-SE');
  return {
    facility:
      typeof requestedFacility === 'string' && facilityOptions.includes(requestedFacility)
        ? requestedFacility
        : null,
    preferredDate:
      typeof preferredVisitDate === 'string' && preferredVisitDate >= today
        ? preferredVisitDate
        : '',
    preferredTimeSlot:
      VISIT_TIME_OPTIONS.find((o) => o.value === preferredVisitTime)?.value ?? null,
  };
}

function useSupportAutosave(
  applicationId: string,
  resume: SupportFormDraft | null,
  fields: Record<string, unknown>,
) {
  const enabled = !env.useMock && resume?.formState !== 'LINKED';
  const snapshot = JSON.stringify(fields);
  const form = useRef({
    draftId: resume?.draftId ?? crypto.randomUUID(),
    version: resume?.version ?? null,
  });
  const lastSaved = useRef(snapshot);
  const latest = useRef(snapshot);
  const queue = useRef(Promise.resolve());
  const [error, setError] = useState('');

  const save = useRef((next: string) => {
    if (next === lastSaved.current) return;
    lastSaved.current = next;
    queue.current = queue.current.then(() =>
      putSupportFormDraft(
        form.current.draftId,
        Number(applicationId),
        form.current.version,
        JSON.parse(next),
      )
        .then((draft) => {
          form.current.version = draft.version;
          setError('');
        })
        .catch((failure: unknown) =>
          setError(failure instanceof Error ? failure.message : '신청서를 임시 저장하지 못했어요.'),
        ),
    );
  }).current;

  useEffect(() => {
    latest.current = snapshot;
    if (!enabled) return;
    const timer = window.setTimeout(() => save(snapshot), 650);
    return () => window.clearTimeout(timer);
  }, [snapshot, enabled, save]);

  useEffect(() => {
    if (!enabled) return;
    return () => save(latest.current);
  }, [enabled, save]);

  return { draftId: enabled ? form.current.draftId : undefined, error };
}

function ApplyForm({
  applicationId,
  application,
  program,
  programId,
  facilityOptions,
  resume,
  resumeFromHome,
}: {
  applicationId: string;
  application: InspectionApplicationDetail;
  program: SupportProgram;
  programId: number;
  facilityOptions: string[];
  resume: SupportFormDraft | null;
  resumeFromHome: boolean;
}) {
  const navigate = useNavigate();
  const { draft, setDraft } = useSupportDraft();
  const saved =
    !resumeFromHome &&
    draft?.applicationId === applicationId &&
    draft.programId === programId &&
    (!resume || draft.formDraftId === resume.draftId)
      ? draft
      : null;
  const [restored] = useState(() => restoreFields(resume, facilityOptions));
  const [selectedFacility, setSelectedFacility] = useState(saved?.facility ?? restored.facility);
  const [preferredDate, setPreferredDate] = useState(
    saved?.preferredDate ?? restored.preferredDate,
  );
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<VisitTimeSlot | null>(
    saved?.preferredTimeSlot ?? restored.preferredTimeSlot,
  );
  const autoAssigned = facilityOptions.length === 1;
  const facility = autoAssigned ? facilityOptions[0] : selectedFacility;
  const filled = facility && preferredDate && preferredTimeSlot;
  const { applicant, address, detailAddress, occupancyType } = application;
  const autosave = useSupportAutosave(applicationId, resume, {
    programId,
    requestedFacility: facility,
    preferredVisitDate: preferredDate,
    preferredVisitTime: preferredTimeSlot,
  });

  return (
    <Screen
      header={{ title: '지원하기' }}
      tab="home"
      bottom={
        <Button
          disabled={!filled}
          onClick={() => {
            if (!filled) return;
            setDraft({
              ...saved,
              applicationId,
              programId,
              facility,
              preferredDate,
              preferredTimeSlot,
              formDraftId: autosave.draftId,
            });
            navigate(generatePath(PATHS.supportSubmit, { applicationId }));
          }}
        >
          다음으로
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pt-5 pb-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-title text-ink">지원 신청 정보를 확인해 주세요.</h2>
          <p className="text-body text-muted">신청자 정보와 희망 방문 일정을 확인해 주세요.</p>
        </section>

        <h3 className="text-section text-ink py-4">{program.name}</h3>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-label text-ink mb-1.5">설치 희망 시설</legend>
          <p className="text-caption text-muted">
            {autoAssigned ? (
              <>
                현장점검에서 권장된 설치 시설이 1개예요.
                <br />
                해당 시설로 자동 지정됩니다.
              </>
            ) : (
              '현장점검에서 권장된 설치 시설이에요. 해당 사업에서 지원 가능한 시설만 선택할 수 있어요.'
            )}
          </p>
          {autoAssigned && (
            <p className="bg-soft text-label text-ink mt-1.5 flex items-center gap-2 rounded-md p-4">
              <img src={radioChecked} alt="" width={20} height={20} className="shrink-0" />
              {facility}
            </p>
          )}
          {!autoAssigned && (
            <>
              <div className="flex flex-col">
                {facilityOptions.map((option) => (
                  <label key={option} className="flex h-11 cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="facility"
                      className="peer sr-only"
                      checked={facility === option}
                      onChange={() => setSelectedFacility(option)}
                    />
                    <img
                      src={facility === option ? radioChecked : radioUnchecked}
                      alt=""
                      width={20}
                      height={20}
                      className="peer-focus-visible:outline-primary shrink-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                    />
                    <span className="text-label text-ink">{option}</span>
                  </label>
                ))}
              </div>
              {facility && (
                <div className="bg-soft text-ink flex flex-col gap-1 rounded-md p-4">
                  <p className="text-caption">선택한 시설</p>
                  <p className="text-section">{facility}</p>
                </div>
              )}
            </>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <TextField size="md" label="이름" value={applicant.name} readOnly />
          <TextField size="md" label="연락처" value={maskPhone(applicant.phone)} readOnly />
        </div>
        <TextField
          size="md"
          label="주소"
          value={detailAddress ? `${address} ${detailAddress}` : address}
          readOnly
        />
        <TextField
          size="md"
          label="거주 형태"
          value={TENURE_LABEL[occupancyType === 'ETC' ? 'OTHER' : occupancyType]}
          readOnly
        />
        <TextField
          size="md"
          type="date"
          label="희망 방문일"
          value={preferredDate}
          min={new Date().toLocaleDateString('sv-SE')}
          onChange={(e) => setPreferredDate(e.target.value)}
          helperText="실제 방문일은 배정 후 확정돼요."
        />
        <ChoiceGroup
          label="방문 가능 시간"
          options={VISIT_TIME_OPTIONS}
          value={preferredTimeSlot}
          onChange={setPreferredTimeSlot}
          className="[&>p]:text-label"
        />
        {autosave.error && (
          <p role="alert" className="text-caption text-danger">
            {autosave.error}
          </p>
        )}
      </div>
    </Screen>
  );
}
