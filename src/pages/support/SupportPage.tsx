import { Check, Info } from 'lucide-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useRecommendedFacilities, useSupportPrograms } from '@/api/applications';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { SupportState } from './SupportState';

export default function SupportPage() {
  const { applicationId } = useParams<'applicationId'>();
  const navigate = useNavigate();
  const programs = useSupportPrograms(applicationId);
  const recommended = useRecommendedFacilities(applicationId);

  if (programs.isLoading || recommended.isLoading) {
    return (
      <Screen header={{ title: '지원사업 확인 중' }} tab="home">
        <div role="status" className="flex flex-col items-center pt-14 text-center">
          <div
            className="border-border border-t-primary size-14 animate-spin rounded-full border-4"
            aria-hidden
          />
          <h2 className="text-title text-ink mt-5">
            우리 집에 맞는
            <br />
            지원사업을 찾고 있어요
          </h2>
          <p className="text-body text-muted mt-5">
            점검 결과와 지원사업의 대상 조건을 확인하고 있어요.
            <br />
            잠시만 기다려 주세요.
          </p>
        </div>
      </Screen>
    );
  }

  if (!programs.data || !recommended.data) {
    return (
      <SupportState
        message="지원사업을 불러오지 못했어요."
        retry={() => {
          programs.refetch();
          recommended.refetch();
        }}
      />
    );
  }

  // ponytail: 첫 사업만 표시. 사업이 여러 개로 오면 목록/선택 UI 추가
  const program = programs.data[0];
  const hasFacilities = recommended.data.facilities.length > 0;

  if (!program) {
    return <SupportState message="지금 신청할 수 있는 지원사업이 없어요." />;
  }

  return (
    <Screen
      header={{ title: '지원하기', className: 'px-5 [&_h1]:text-[18px] [&_svg]:size-6' }}
      tab="home"
      bottom={
        <Button
          className="-mt-1 mb-1"
          onClick={() =>
            navigate(
              hasFacilities
                ? generatePath(PATHS.supportRequirements, { applicationId: applicationId! })
                : PATHS.home,
            )
          }
        >
          {hasFacilities ? '지원 조건 확인하기' : '홈으로'}
        </Button>
      }
    >
      <div className="pt-[18px]">
        <section>
          <h2 className="text-support-heading text-[22px] leading-[34px] font-bold">
            확인해볼 수 있는 사업이 있어요.
          </h2>
          <p className="text-support-muted mt-2.5 text-[13px] leading-[17px]">
            <span className="block">
              현장에서 확인된 취약지점과 전문가 권장 예방조치를 바탕으로
            </span>
            관련 지원제도를 안내해 드려요.
          </p>
        </section>

        <section className="mt-[33px]">
          <div className="border-support-rule border-b pb-2">
            <p className="text-support-muted text-[14px] leading-[23px] font-bold">관련 지원사업</p>
            <h3 className="text-support-heading mt-1 text-[22px] leading-[30px] font-bold">
              부천시
            </h3>
          </div>

          <div className="bg-support-card mt-4 flex min-h-28 items-start gap-3.5 rounded-[13px] px-3.5 py-[17px]">
            <span
              aria-hidden
              className="bg-support-facility-icon-bg text-support-facility-icon grid size-[52px] shrink-0 place-items-center rounded-xl"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <rect x="1" y="1" width="18" height="18" />
                <path d="M5.5 1v18M10 1v18M14.5 1v18" />
              </svg>
            </span>
            <div className="min-w-0 wrap-anywhere">
              <h4 className="text-support-card-heading text-[18px] leading-7 font-bold">
                {program.name}
              </h4>
              {hasFacilities && (
                <p className="text-support-card-muted mt-2 text-xs leading-4">
                  {program.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {hasFacilities && (
          <section className="mt-6">
            <h3 className="text-support-card-heading text-[18px] leading-[30px] font-bold">
              이 사업이 표시된 이유
            </h3>
            <div className="bg-surface border-support-reason-border mt-2 min-h-[153px] rounded-[13px] border p-[13px] pt-3.5">
              <div className="border-support-divider flex items-center gap-2.5 border-b pb-4">
                <span
                  aria-hidden
                  className="bg-support-reason-icon-bg text-support-reason-icon grid size-8 shrink-0 place-items-center rounded-full"
                >
                  <Check size={20} strokeWidth={3} />
                </span>
                <p className="text-support-reason-text text-[13px] leading-[18px]">
                  {program.reason || '현장점검에서 침수 취약지점이 확인됐어요.'}
                </p>
              </div>
              <div className="mt-[5px] flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="bg-support-reason-icon-bg text-support-reason-icon grid size-8 shrink-0 place-items-center rounded-full"
                >
                  <Info size={18} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-support-highlight pt-2 text-[15px] leading-5 font-bold">
                    지원이 확정된 것은 아니에요.
                  </p>
                  <p className="text-support-muted mt-2 text-xs leading-4">
                    <span className="block">실제 지원 가능 여부와 지원 범위는 신청 후</span>
                    행정 검토를 통해 결정돼요.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Screen>
  );
}
