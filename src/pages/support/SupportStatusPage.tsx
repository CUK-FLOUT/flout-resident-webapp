import { useState, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { generatePath, Navigate, useNavigate, useParams } from 'react-router';
import {
  useInspectionApplication,
  useSupportApproval,
  useSupportRejection,
  useSupportReview,
  useSupportSchedule,
} from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button, StatusText, StepProgress } from '@/components/ui';
import {
  SUPPORT_DECISION_LABEL,
  SUPPORT_STEPS,
  TENURE_LABEL,
  VISIT_TIME_LABEL,
} from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { cn } from '@/lib/cn';
import { formatDate, formatMonthDay } from '@/lib/date';
import { supportApprovalSeenStorage } from '@/lib/storage';

const header = { title: '지원하기' };
const CONSTRUCTION_STAGES = ['CONSTRUCTION_SCHEDULED', 'CONSTRUCTION_IN_PROGRESS', 'COMPLETED'];

export default function SupportStatusPage() {
  const { applicationId } = useParams<'applicationId'>();
  const application = useInspectionApplication(applicationId);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);

  if (application.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>진행 상태를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!application.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={<Button onClick={() => application.refetch()}>다시 시도</Button>}
      >
        <StateMessage>진행 상태를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const { progress } = application.data;
  const support = progress?.support;

  if (progress?.stage && CONSTRUCTION_STAGES.includes(progress.stage)) {
    return (
      <Navigate to={generatePath(PATHS.construction, { applicationId: applicationId! })} replace />
    );
  }

  if (support?.status === 'SUBMITTED') {
    return <ReviewView id={support.supportApplicationId} />;
  }

  if (support?.status === 'REJECTED') {
    return <RejectedView id={support.supportApplicationId} />;
  }

  if (support?.status === 'APPROVED') {
    const id = support.supportApplicationId;
    if (approvalConfirmed || supportApprovalSeenStorage.has(id)) return <SchedulingView id={id} />;
    return (
      <ApprovedView
        id={id}
        onConfirm={() => {
          supportApprovalSeenStorage.add(id);
          setApprovalConfirmed(true);
        }}
      />
    );
  }

  return (
    <Screen header={header} tab="home">
      <StateMessage>진행 중인 지원 신청이 없어요.</StateMessage>
    </Screen>
  );
}

function DetailScreen<T>({
  query,
  bottom,
  children,
}: {
  query: UseQueryResult<T>;
  bottom?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>진행 상태를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!query.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={<Button onClick={() => query.refetch()}>다시 시도</Button>}
      >
        <StateMessage>진행 상태를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  return (
    <Screen header={header} tab="home" bottom={bottom}>
      {children(query.data)}
    </Screen>
  );
}

function ReviewView({ id }: { id: number }) {
  const navigate = useNavigate();

  return (
    <DetailScreen
      query={useSupportReview(id)}
      bottom={<Button onClick={() => navigate(PATHS.home)}>홈으로 가기</Button>}
    >
      {(review) => (
        <div className="flex flex-col gap-3 pt-5">
          <section className="text-ink flex flex-col gap-3">
            <ApplicantLine {...review} />
            <h2 className="text-title">
              제출한 내용을
              <br />
              검토하고 있어요.
            </h2>
            <p className="text-body">
              담당자가 신청 조건과 제출된 서류를 확인하고 있어요.
              <br />
              결과가 등록되면 알림으로 안내해 드려요.
            </p>
          </section>

          <StepProgress steps={SUPPORT_STEPS} current={1} />

          <section className="text-ink flex flex-col gap-4">
            <h3 className="text-label">신청 정보</h3>
            <dl className="text-caption flex flex-col gap-3">
              <Row label="신청일" valueClassName="">
                {formatDate(review.submittedAt)}
              </Row>
              <Row label="처리 상태" valueClassName="">
                {SUPPORT_DECISION_LABEL.PENDING}
              </Row>
            </dl>
          </section>

          <ol>
            <li className="text-ink flex items-center gap-3">
              <span aria-hidden className="bg-primary size-3 shrink-0 rounded-full" />
              <span className="flex flex-col gap-1">
                <span className="text-caption">
                  {formatMonthDay(review.submittedAt)} · 신청 접수
                </span>
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
                {review.requestedFacility} /{' '}
                {TENURE_LABEL[review.occupancyType === 'ETC' ? 'OTHER' : review.occupancyType]}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-caption">희망 시공일 / 시간</dt>
              <dd className="text-body">
                {formatDate(review.preferredConstructionDate)} /{' '}
                {
                  VISIT_TIME_LABEL[
                    review.preferredTimeSlot === 'ANY' ? 'ANYTIME' : review.preferredTimeSlot
                  ]
                }
              </dd>
            </div>
          </dl>
        </div>
      )}
    </DetailScreen>
  );
}

function ApprovedView({ id, onConfirm }: { id: number; onConfirm: () => void }) {
  return (
    <DetailScreen
      query={useSupportApproval(id)}
      bottom={<Button onClick={onConfirm}>일정 확인하기</Button>}
    >
      {(approval) => (
        <DecidedLayout
          {...approval}
          step={2}
          hero={
            <>
              <h2 className="text-title text-success">승인</h2>
              <p className="text-heading text-ink">지원 대상자로 확인됐어요.</p>
            </>
          }
          description={
            <>
              지원 승인이 완료됐어요.
              <br />
              등록된 시공 일정과 진행상태를 확인할 수 있어요.
            </>
          }
        >
          <section className="flex flex-col gap-4">
            <h3 className="text-heading text-ink">검토 결과</h3>
            <dl className="text-body text-ink flex flex-col gap-3">
              <Row label="지원사업">{approval.programName}</Row>
              <Row label="결과" valueClassName="text-label text-success">
                승인
              </Row>
            </dl>
          </section>
          <NextStep title="일정 조율" />
          <dl className="flex flex-col gap-[18px]">
            <Field label="승인 시설">{approval.supportScope || approval.requestedFacility}</Field>
            <Field label="처리 상태">시공 예정</Field>
          </dl>
        </DecidedLayout>
      )}
    </DetailScreen>
  );
}

function SchedulingView({ id }: { id: number }) {
  return (
    <DetailScreen query={useSupportSchedule(id)}>
      {(schedule) => (
        <DecidedLayout
          {...schedule}
          step={3}
          hero={
            <>
              <h2 className="text-title text-primary">일정 조율 중</h2>
              <p className="text-heading text-ink">시공 일정을 확인하고 있어요.</p>
            </>
          }
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
              <Row label="지원사업">{schedule.programName}</Row>
              <Row label="현재 단계" valueClassName="text-label text-primary">
                일정 조율 중
              </Row>
            </dl>
          </section>
          <NextStep title="일정이 정해지면 알려드려요.">
            확정된 날짜와 방문 시간을 안내해 드릴게요.
          </NextStep>
          <dl className="flex flex-col gap-[18px]">
            <Field label="신청 시설">{schedule.requestedFacility}</Field>
            <Field label="처리 상태">일정 조율 중</Field>
          </dl>
        </DecidedLayout>
      )}
    </DetailScreen>
  );
}

function RejectedView({ id }: { id: number }) {
  return (
    <DetailScreen query={useSupportRejection(id)}>
      {(rejection) => (
        <DecidedLayout
          {...rejection}
          step={2}
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
            {rejection.rejectionReason && <Field label="사유">{rejection.rejectionReason}</Field>}
            <Field label="처리 상태" valueClassName="text-danger">
              {SUPPORT_DECISION_LABEL.REJECTED}
            </Field>
            <Field label="신청 시설">{rejection.requestedFacility}</Field>
          </dl>
        </DecidedLayout>
      )}
    </DetailScreen>
  );
}

interface ApplicantLineProps {
  receiptNo: string;
  applicantName: string;
  address: string;
}

function DecidedLayout({
  step,
  hero,
  description,
  children,
  ...applicant
}: ApplicantLineProps & {
  step: number;
  hero: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[18px] pt-5">
      <div className="flex items-center justify-between gap-3">
        <ApplicantLine {...applicant} />
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

function ApplicantLine({ receiptNo, applicantName, address }: ApplicantLineProps) {
  return (
    <p className="text-body text-ink min-w-0">
      {receiptNo} · {applicantName} · {address}
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

function NextStep({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="text-ink flex flex-col gap-1">
      <h3 className="text-heading">다음 단계</h3>
      <p className="text-section">{title}</p>
      {children && <p className="text-body">{children}</p>}
    </section>
  );
}
