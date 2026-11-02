import { Check, Info } from 'lucide-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useSupportPrograms } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';

/**
 * Figma: 04-1 지원하기_지원사업 (1115:3218)
 * 기능명세: RESULT-07 지원 연계 · SUPPORT-01 지원 대상·내용 안내
 *
 * 원칙: 지원은 행정 검토 후 확정되므로 "확정"처럼 보이지 않게 미확정 안내를 함께 둡니다.
 */
export default function SupportPage() {
  const { applicationId } = useParams<'applicationId'>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSupportPrograms(applicationId);
  const header = { title: '지원하기' };

  if (isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>지원사업을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={<Button onClick={() => refetch()}>다시 시도</Button>}
      >
        <StateMessage>지원사업을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  // ponytail: 첫 사업만 표시. 사업이 여러 개로 오면 목록/선택 UI 추가
  const program = data[0];

  if (!program) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>지금 신청할 수 있는 지원사업이 없어요.</StateMessage>
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
            navigate(generatePath(PATHS.supportRequirements, { applicationId: applicationId! }))
          }
        >
          지원 조건 확인하기
        </Button>
      }
    >
      <div className="flex flex-col gap-6 pt-5">
        <section className="flex flex-col gap-3">
          <h2 className="text-title text-ink">확인해볼 수 있는 사업이 있어요.</h2>
          <p className="text-body text-muted">
            현장에서 확인된 취약지점과 전문가 권장 예방조치를 바탕으로 관련 지원제도를 안내해
            드려요.
          </p>
        </section>

        <p className="text-caption text-muted flex justify-between">
          <span>관련 지원사업</span>
          <span>부천시</span>
        </p>

        <section className="border-border flex flex-col gap-2 border-y py-4">
          <h3 className="text-heading text-primary">{program.name}</h3>
          <p className="text-body text-muted">{program.description}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-heading text-ink">이 사업이 표시된 이유</h3>
          <p className="text-body text-ink flex items-center gap-3">
            <span className="bg-page text-ink flex size-8 shrink-0 items-center justify-center rounded-full">
              <Check size={16} aria-hidden />
            </span>
            현장점검에서 침수 취약지점이 확인됐어요.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-label text-warning flex items-start gap-3">
            <Info size={24} aria-hidden className="text-ink shrink-0" />
            지원이 확정된 것은 아니에요.
          </p>
          <p className="text-caption text-muted">
            실제 지원 가능 여부와 지원 범위는 신청 후 행정 검토를 통해 결정돼요.
          </p>
        </section>
      </div>
    </Screen>
  );
}
