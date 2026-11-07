import type { ReactNode } from 'react';
import { useParams } from 'react-router';
import { useApplication, useInspectionResult, useSupportProgress } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { APPLICATION_STAGE, SUPPORT_DECISION_LABEL } from '@/constants/labels';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date';
import { maskPhone } from '@/lib/phone';
import type { ApplicationStage } from '@/types/domain';
import { StageBadge } from './StageBadge';

const STAGE_ORDER = Object.keys(APPLICATION_STAGE) as ApplicationStage[];
const reached = (stage: ApplicationStage, target: ApplicationStage) =>
  STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(target);

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<'applicationId'>();
  const application = useApplication(applicationId);
  const stage = application.data?.stage ?? 'INSPECTION_RECEIVED';
  const idFrom = (target: ApplicationStage) => (reached(stage, target) ? applicationId : undefined);
  const result = useInspectionResult(idFrom('INSPECTION_COMPLETED'));
  const support = useSupportProgress(idFrom('SUPPORT_RECEIVED'));
  const header = { title: '신청 상세' };

  if (application.isLoading) {
    return (
      <Screen header={header} tab="applications">
        <StateMessage>신청 내용을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!application.data) {
    return (
      <Screen
        header={header}
        tab="applications"
        bottom={<Button onClick={() => application.refetch()}>다시 시도</Button>}
      >
        <StateMessage>신청 내용을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const { title, address, createdAt, request } = application.data;
  const [category, name = title] = title.split(' · ');

  return (
    <Screen header={header} tab="applications">
      <div className="flex flex-col gap-3.5 pt-3">
        <section className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[12px] leading-[22px] font-medium">{category}</span>
            <StageBadge stage={stage} />
          </div>
          <h2 className="text-title text-ink">{name}</h2>
          <p className="text-caption text-muted">
            {application.data.id} · {address}
          </p>
        </section>

        <Section title="신청 정보">
          <Row label="이름">{request.applicantName}</Row>
          <Row label="연락처">{maskPhone(request.phone)}</Row>
          <Row label="신청일">{formatDate(createdAt)}</Row>
          <Row label="주소">{request.address}</Row>
          <Row label="희망 방문일">{formatDate(request.preferredDate)}</Row>
        </Section>

        <Section title="현장점검 결과">
          <Row label="전문가 의견">{result.data?.summary}</Row>
        </Section>

        <Section title="지원 신청 정보">
          <Row label="신청 지원 시설">{support.data?.facility}</Row>
          <Row label="지원 검토 결과">
            {support.data && SUPPORT_DECISION_LABEL[support.data.decision]}
          </Row>
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
  const empty = children === undefined || children === false || children === '';
  return (
    <div className="text-muted flex justify-between gap-3 py-0.5 text-[13px] leading-[22px]">
      <dt className="shrink-0">{label}</dt>
      <dd className={cn('text-right', !empty && 'text-ink font-medium')}>
        {empty ? '데이터 없음' : children}
      </dd>
    </div>
  );
}
