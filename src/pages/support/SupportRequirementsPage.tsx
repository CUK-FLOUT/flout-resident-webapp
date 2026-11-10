import type { LucideIcon } from 'lucide-react';
import { Check, FileText } from 'lucide-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useSupportPrograms } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import type { SupportRequirement } from '@/types/domain';

export default function SupportRequirementsPage() {
  const { applicationId } = useParams<'applicationId'>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSupportPrograms(applicationId);
  const header = { title: '지원하기' };
  const program = data?.[0];

  if (isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>신청 조건을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (isError || !program) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={<Button onClick={() => refetch()}>다시 시도</Button>}
      >
        <StateMessage>신청 조건을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      tab="home"
      bottom={
        <Button
          onClick={() =>
            navigate(generatePath(PATHS.supportApply, { applicationId: applicationId! }))
          }
        >
          지원 신청 작성
        </Button>
      }
    >
      <div className="flex flex-col gap-6 pt-5">
        <section className="flex flex-col gap-2">
          <h2 className="text-title text-ink">신청 전에 확인해 주세요.</h2>
          <p className="text-body text-muted">
            아래 조건과 필요한 서류를 확인한 뒤 지원 신청을 진행할 수 있어요.
          </p>
        </section>

        <section className="border-border flex flex-col gap-1.5 border-y py-4">
          <p className="text-muted text-[12px] leading-5">신청할 지원사업</p>
          <h3 className="text-heading text-ink">{program.name}</h3>
        </section>

        <RequirementList title="신청 조건" icon={Check} items={program.conditions} />
        <RequirementList title="준비할 서류" icon={FileText} items={program.requiredDocuments} />
      </div>
    </Screen>
  );
}

function RequirementList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: SupportRequirement[];
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <h3 className="text-heading text-ink">{title}</h3>
      <ul className="flex flex-col gap-3.5">
        {items.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="text-primary flex size-6 shrink-0 items-center justify-center">
              <Icon size={14} strokeWidth={2.5} aria-hidden />
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="text-label text-ink">{item.title}</span>
              {item.description && (
                <span className="text-caption text-muted">{item.description}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
