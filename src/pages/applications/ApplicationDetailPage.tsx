import type { ReactNode } from 'react';
import { useParams } from 'react-router';
import { useInspectionApplication } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { SUPPORT_DECISION_LABEL } from '@/constants/labels';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date';
import { getInspectionAddress, getInspectionStage } from '@/lib/inspectionApplication';
import { maskPhone } from '@/lib/phone';
import type { ConstructionStatus } from '@/types/domain';
import { StageBadge } from './StageBadge';

const CONSTRUCTION_STATUS_LABEL: Record<ConstructionStatus, string> = {
  PENDING: '시공 준비 중',
  SCHEDULED: '시공 예정',
  IN_PROGRESS: '시공 진행',
  COMPLETED: '시공 완료',
};

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<'applicationId'>();
  const { data, isLoading, refetch } = useInspectionApplication(applicationId);
  const header = { title: '신청 상세' };

  if (isLoading) {
    return (
      <Screen header={header} tab="applications">
        <StateMessage>신청 내용을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen
        header={header}
        tab="applications"
        bottom={<Button onClick={() => refetch()}>다시 시도</Button>}
      >
        <StateMessage>신청 내용을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const stage = getInspectionStage(data);
  const { support, construction, inspectionResultSummary } = data.progress ?? {};
  const [category, name] = (data.progress?.title ?? '현장점검 · 침수 위험 점검 신청').split(' · ');
  const address = getInspectionAddress(data);
  const appliedAt = data.submittedAt ?? data.createdAt;

  return (
    <Screen header={header} tab="applications">
      <div className="flex flex-col gap-3.5 pt-3">
        <section className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[12px] leading-[22px] font-medium">{category}</span>
            {stage && <StageBadge stage={stage} />}
          </div>
          <h2 className="text-title text-ink">{name ?? category}</h2>
          <p className="text-caption text-muted">
            {data.receiptNumber} · {address}
          </p>
        </section>

        <Section title="신청 정보">
          <Row label="이름">{data.applicant.name}</Row>
          <Row label="연락처">{data.applicant.phone && maskPhone(data.applicant.phone)}</Row>
          <Row label="신청일">{appliedAt && formatDate(appliedAt)}</Row>
          <Row label="주소">{address}</Row>
          <Row label="희망 방문일">
            {data.preferredVisitDate && formatDate(data.preferredVisitDate)}
          </Row>
        </Section>

        <Section title="현장점검 결과">
          <Row label="전문가 의견">{inspectionResultSummary}</Row>
        </Section>

        <Section title="지원 신청 정보">
          <Row label="신청 지원 시설">{support?.requestedFacility}</Row>
          <Row label="지원 검토 결과">
            {support &&
              support.status !== 'DRAFT' &&
              SUPPORT_DECISION_LABEL[support.status === 'SUBMITTED' ? 'PENDING' : support.status]}
          </Row>
          {support?.status === 'APPROVED' && <Row label="지원 범위">{support.supportScope}</Row>}
          {support?.status === 'REJECTED' && (
            <Row label="미승인 사유">{support.rejectionReason}</Row>
          )}
        </Section>

        <Section title="시공 정보">
          <Row label="시공 상태">
            {construction && CONSTRUCTION_STATUS_LABEL[construction.status]}
          </Row>
          <Row label="시공일">
            {construction?.scheduledAt && formatDate(construction.scheduledAt)}
          </Row>
          <Row label="완료일">
            {construction?.completedAt && formatDate(construction.completedAt)}
          </Row>
          <Row label="최종 설치 결과">{construction?.finalInstallationResult}</Row>
        </Section>
      </div>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border flex flex-col gap-1 border-t pt-3">
      <h3 className="text-ink text-[20px] leading-7 font-semibold">{title}</h3>
      <dl className="flex flex-col">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  const empty =
    children === undefined || children === null || children === false || children === '';
  return (
    <div className="text-muted flex justify-between gap-3 py-0.5 text-[13px] leading-[22px]">
      <dt className="shrink-0">{label}</dt>
      <dd className={cn('text-right', !empty && 'text-ink font-medium')}>
        {empty ? '데이터 없음' : children}
      </dd>
    </div>
  );
}
