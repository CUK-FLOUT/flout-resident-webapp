import type { ReactNode } from 'react';
import { generatePath, useMatch, useNavigate, useParams } from 'react-router';
import { useApplication, useSupportProgress } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button, StatusText, StepProgress } from '@/components/ui';
import {
  CONSENT_STATUS_LABEL,
  SUPPORT_DECISION_LABEL,
  SUPPORT_STEPS,
  TENURE_LABEL,
  VISIT_TIME_LABEL,
} from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { cn } from '@/lib/cn';
import { formatDate, formatMonthDay, formatTime } from '@/lib/date';
import type { ApplicationDetail, SupportProgress } from '@/types/domain';
import { ConsentView } from './SupportConsentPage';

export default function SupportStatusPage() {
  const { applicationId } = useParams<'applicationId'>();
  const navigate = useNavigate();
  const isConsent = useMatch(PATHS.supportConsent);
  const progress = useSupportProgress(applicationId);
  const application = useApplication(applicationId);
  const header = { title: '지원하기' };

  if (progress.isLoading || application.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>진행 상태를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!progress.data || !application.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          <Button
            onClick={() => {
              progress.refetch();
              application.refetch();
            }}
          >
            다시 시도
          </Button>
        }
      >
        <StateMessage>진행 상태를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const data = { progress: progress.data, application: application.data };
  const { decision, scheduledAt } = progress.data;
  const rejected = !isConsent && decision === 'REJECTED';

  return (
    <Screen
      header={header}
      tab="home"
      bottom={
        rejected && (
          <Button variant="secondary" onClick={() => navigate(PATHS.home)}>
            홈으로 가기
          </Button>
        )
      }
    >
      {isConsent ? (
        <ConsentView {...data} />
      ) : decision === 'PENDING' ? (
        <ReviewView {...data} />
      ) : rejected ? (
        <RejectedView {...data} />
      ) : scheduledAt ? (
        <ApprovedView {...data} scheduledAt={scheduledAt} />
      ) : (
        <SchedulingView {...data} />
      )}
    </Screen>
  );
}

interface ViewProps {
  progress: SupportProgress;
  application: ApplicationDetail;
}

/** 04-5 지원검토 */
function ReviewView({ progress, application }: ViewProps) {
  const navigate = useNavigate();
  const { submittedAt, decision, consent, facility, preferredDate, preferredTimeSlot } = progress;
  const { id, request } = application;

  return (
    <div className="flex flex-col gap-3 pt-5">
      <section className="text-ink flex flex-col gap-3">
        <ApplicantLine application={application} />
        <h2 className="text-title">
          제출한 내용을
          <br />
          검토하고 있어요.
        </h2>
        <p className="text-body">
          담당자가 신청 조건과 제출된 서류를 확인하고 있어요. 결과가 등록되면 알림으로 안내해
          드려요.
        </p>
      </section>

      <StepProgress steps={SUPPORT_STEPS} current={1} />

      <section className="text-ink flex flex-col gap-4">
        <h3 className="text-label">신청 정보</h3>
        <dl className="text-caption flex flex-col gap-3">
          <Row label="신청일" valueClassName="">
            {formatDate(submittedAt)}
          </Row>
          <Row label="처리 상태" valueClassName="">
            {SUPPORT_DECISION_LABEL[decision]}
          </Row>
        </dl>
      </section>

      <ol>
        <li className="text-ink flex items-center gap-3">
          <span aria-hidden className="bg-primary size-3 shrink-0 rounded-full" />
          <span className="flex flex-col gap-1">
            <span className="text-caption">{formatMonthDay(submittedAt)} · 신청 접수</span>
            <span className="text-body">제출한 신청 정보와 서류가 정상적으로 접수됐어요.</span>
          </span>
        </li>
      </ol>

      <section className="bg-page text-ink flex flex-col gap-3 rounded-lg p-5">
        <p className="text-caption">지금은 기다려 주세요</p>
        <p className="text-label">현재 추가로 할 일은 없어요.</p>
        <p className="text-body">추가 확인이 필요한 경우 담당자가 별도로 안내합니다.</p>
      </section>

      <dl className="text-ink flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <dt className="text-caption">신청 시설 / 거주 형태</dt>
          <dd className="text-body">
            {facility} / {TENURE_LABEL[request.tenure]}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-caption">희망 시공일 / 시간</dt>
          <dd className="text-body">
            {formatDate(preferredDate)} / {VISIT_TIME_LABEL[preferredTimeSlot]}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        {consent !== 'NOT_REQUIRED' && (
          <Button
            variant="secondary"
            onClick={() => navigate(generatePath(PATHS.supportConsent, { applicationId: id }))}
          >
            {request.tenure === 'OWNER' ? '주택 소유 확인 진행상태' : '임대인 동의 진행상태 확인'}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => navigate(generatePath(PATHS.result, { applicationId: id }))}
        >
          내 점검 결과 보기
        </Button>
      </div>
    </div>
  );
}

/** 04-8 일정 조율 중 */
function SchedulingView({ progress, application }: ViewProps) {
  return (
    <DecidedLayout
      application={application}
      step={3}
      hero={<h2 className="text-title text-primary">일정 조율 중</h2>}
      description={
        <>
          필요한 서류 확인이 완료됐어요.
          <br />
          담당자가 시공 가능 일정을 확인하고 있어요.
        </>
      }
    >
      <section className="flex flex-col gap-4">
        <h3 className="text-heading text-ink">진행 현황</h3>
        <dl className="text-body text-ink flex flex-col gap-3">
          <Row label="지원사업">{progress.programName}</Row>
          <Row label="현재 단계" valueClassName="text-label text-primary">
            일정 조율 중
          </Row>
        </dl>
      </section>
      <NextStep title="일정이 정해지면 알려드려요.">
        확정된 날짜와 방문 시간을 안내해 드릴게요.
      </NextStep>
      <dl className="flex flex-col gap-[18px]">
        <Field label="신청 시설 / 동의 확인">
          {progress.facility} / {CONSENT_STATUS_LABEL[progress.consent]}
        </Field>
        <Field label="처리 상태">일정 조율 중</Field>
      </dl>
    </DecidedLayout>
  );
}

/** 04-9 승인 */
function ApprovedView({ progress, application, scheduledAt }: ViewProps & { scheduledAt: string }) {
  const consent =
    progress.consent === 'NOT_REQUIRED'
      ? CONSENT_STATUS_LABEL.NOT_REQUIRED
      : `필요 · ${CONSENT_STATUS_LABEL[progress.consent]}`;

  return (
    <DecidedLayout
      application={application}
      step={4}
      hero={
        <>
          <h2 className="text-title text-success">승인</h2>
          <p className="text-heading text-ink">지원 대상자로 확인됐어요.</p>
        </>
      }
      description={
        <>
          지원 승인과 필요한 동의 확인이 완료됐어요.
          <br />
          등록된 시공 일정과 진행상태를 확인할 수 있어요.
        </>
      }
    >
      <section className="flex flex-col gap-4">
        <h3 className="text-heading text-ink">검토 결과</h3>
        <dl className="text-body text-ink flex flex-col gap-3">
          <Row label="지원사업">{progress.programName}</Row>
          <Row label="결과" valueClassName="text-label text-success">
            승인
          </Row>
        </dl>
      </section>
      <NextStep title="시공 일정이 등록됐어요.">
        {formatDate(scheduledAt)} · {formatTime(scheduledAt)}
      </NextStep>
      <dl className="flex flex-col gap-[18px]">
        <Field label="승인 시설 / 임대인 동의">
          {progress.facility} / {consent}
        </Field>
        <Field label="처리 상태">시공 예정</Field>
      </dl>
    </DecidedLayout>
  );
}

/** 04-10 미승인 */
function RejectedView({ progress, application }: ViewProps) {
  return (
    <DecidedLayout
      application={application}
      step={4}
      hero={
        <>
          <h2 className="text-title text-danger">미승인</h2>
          <p className="text-heading text-ink">이번 지원은 진행하기 어려워요.</p>
        </>
      }
      description={
        <>
          신청 내용을 검토한 결과, 이번 지원은 미승인됐어요.
          <br />
          아래에서 검토 결과와 사유를 확인해 주세요.
        </>
      }
    >
      <section className="text-ink flex flex-col gap-4">
        <h3 className="text-heading">검토 결과</h3>
        <p className="text-body">
          지원 대상 여부에 대한 담당자 검토 결과
          <br />
          이번 신청은 미승인 처리되었습니다.
        </p>
      </section>
      <dl className="flex flex-col gap-[18px]">
        {progress.rejectReason && <Field label="사유">{progress.rejectReason}</Field>}
        <Field label="처리 상태" valueClassName="text-danger">
          {SUPPORT_DECISION_LABEL.REJECTED}
        </Field>
        <Field label="신청 시설">{progress.facility}</Field>
      </dl>
    </DecidedLayout>
  );
}

/** 04-8 ~ 04-10 공통: 신청자 줄 + 검토 완료 표시, 제목, 진행 단계 */
function DecidedLayout({
  application,
  step,
  hero,
  description,
  children,
}: {
  application: ApplicationDetail;
  step: number;
  hero: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[18px] pt-5">
      <div className="flex items-center justify-between gap-3">
        <ApplicantLine application={application} />
        <StatusText tone="success" className="shrink-0">
          검토 완료
        </StatusText>
      </div>
      <section className="flex flex-col gap-3">
        {hero}
        <p className="text-body text-ink">{description}</p>
      </section>
      <StepProgress steps={SUPPORT_STEPS} current={step} />
      {children}
    </div>
  );
}

function ApplicantLine({ application: { id, request } }: { application: ApplicationDetail }) {
  return (
    <p className="text-body text-ink min-w-0">
      {id} · {request.applicantName} · {request.address}
    </p>
  );
}

function Row({
  label,
  valueClassName,
  children,
}: {
  label: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0">{label}</dt>
      <dd className={cn('text-right', valueClassName ?? 'text-label')}>{children}</dd>
    </div>
  );
}

function Field({
  label,
  valueClassName = 'text-ink',
  children,
}: {
  label: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-section text-ink">{label}</dt>
      <dd className={cn('text-body', valueClassName)}>{children}</dd>
    </div>
  );
}

function NextStep({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="text-ink flex flex-col gap-1">
      <h3 className="text-heading">다음 단계</h3>
      <p className="text-section">{title}</p>
      <p className="text-body">{children}</p>
    </section>
  );
}
