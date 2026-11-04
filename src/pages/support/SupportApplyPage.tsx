import { useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import {
  useApplication,
  useApplySupport,
  useInspectionResult,
  useSupportPrograms,
} from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button, ChoiceGroup, TextField } from '@/components/ui';
import { TENURE_LABEL, VISIT_TIME_OPTIONS, VULNERABILITY_TYPE_LABEL } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { maskPhone } from '@/lib/phone';
import type {
  ApplicationDetail,
  InspectionResult,
  SupportProgram,
  VisitTimeSlot,
} from '@/types/domain';

export default function SupportApplyPage() {
  const { applicationId } = useParams<'applicationId'>();
  const application = useApplication(applicationId);
  const programs = useSupportPrograms(applicationId);
  const result = useInspectionResult(applicationId);
  const header = { title: '지원하기' };
  const queries = [application, programs, result];
  const program = programs.data?.[0];

  if (queries.some((q) => q.isLoading)) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>신청 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!application.data || !program || !result.data) {
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

  return <ApplyForm application={application.data} program={program} result={result.data} />;
}

function ApplyForm({
  application,
  program,
  result,
}: {
  application: ApplicationDetail;
  program: SupportProgram;
  result: InspectionResult;
}) {
  const navigate = useNavigate();
  const apply = useApplySupport();
  // 신청자 정보는 현장점검 신청 데이터를 보여주기만 하고, 방문 일정만 새로 고릅니다
  const { request } = application;
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<VisitTimeSlot | null>(null);
  const filled = preferredDate && preferredTimeSlot;

  const facility = result.recommendations.map((r) => r.facility).join(', ');
  const pointLabels = [...new Set(result.points.map((p) => VULNERABILITY_TYPE_LABEL[p.type]))];

  const submit = () =>
    filled &&
    apply.mutate(
      {
        applicationId: application.id,
        programId: program.id,
        facility,
        preferredDate,
        preferredTimeSlot,
        documents: [],
      },
      {
        onSuccess: () =>
          navigate(generatePath(PATHS.supportComplete, { applicationId: application.id })),
      },
    );

  return (
    <Screen
      header={{ title: '지원하기' }}
      tab="home"
      bottom={
        <>
          {apply.isError && (
            <p role="alert" className="text-caption text-danger">
              신청을 접수하지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          <Button
            onClick={submit}
            disabled={!filled}
            loading={apply.isPending}
            loadingText="접수하는 중…"
          >
            신청 접수하기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pt-4">
        <section className="flex flex-col gap-1.5">
          <h2 className="text-title text-ink">지원 신청 정보를 확인해 주세요.</h2>
          <p className="text-body text-muted">신청자 정보와 희망 방문 일정을 확인해 주세요.</p>
        </section>

        <section className="flex flex-col gap-1">
          <h3 className="text-section text-ink">{program.name}</h3>
          <p className="text-caption text-muted">신청 지원 시설 · {facility}</p>
          <p className="text-muted text-[12px] leading-[22px]">
            접수번호 / 취약지점 · {application.id} / {pointLabels.join(' · ')}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <TextField size="md" label="이름" value={request.applicantName} readOnly />
          <TextField size="md" label="연락처" value={maskPhone(request.phone)} readOnly />
        </div>
        <TextField size="md" label="주소" value={request.address} readOnly />
        <TextField size="md" label="거주 형태" value={TENURE_LABEL[request.tenure]} readOnly />
        <TextField
          size="md"
          type="date"
          label="희망 방문일"
          value={preferredDate}
          min={new Date().toLocaleDateString('sv-SE') /* 로컬 기준 YYYY-MM-DD */}
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
      </div>
    </Screen>
  );
}
