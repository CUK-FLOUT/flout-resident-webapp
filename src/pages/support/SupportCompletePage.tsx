import { FileText, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useApplication, useSupportProgress } from '@/api/applications';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { SUPPORT_DECISION_LABEL } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { formatDate } from '@/lib/date';

export default function SupportCompletePage() {
  const { applicationId } = useParams<'applicationId'>();
  const navigate = useNavigate();
  const progress = useSupportProgress(applicationId);
  const application = useApplication(applicationId);
  const goHome = () => navigate(PATHS.home);

  const header = {
    title: '지원하기',
    right: (
      <button
        type="button"
        aria-label="닫기"
        onClick={goHome}
        className="text-ink flex size-11 items-center justify-center"
      >
        <X size={26} />
      </button>
    ),
  };
  const bottom = (
    <Button variant="secondary" onClick={goHome}>
      홈으로 가기
    </Button>
  );

  if (progress.isLoading || application.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>접수 내용을 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!progress.data || !application.data) {
    return (
      <Screen header={header} tab="home" bottom={bottom}>
        <StateMessage>접수 내용을 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  const { programName, submittedAt, decision } = progress.data;
  const rows = [
    ['지원사업', programName],
    ['신청일', formatDate(submittedAt)],
    ['현재 상태', SUPPORT_DECISION_LABEL[decision]],
  ];

  return (
    <Screen header={header} tab="home" bottom={bottom}>
      <div className="flex flex-col gap-6 pt-5">
        <section className="flex flex-col gap-2.5">
          <p className="text-label text-success flex items-center gap-2">
            <span aria-hidden className="bg-primary size-2 rounded-full" />
            접수 완료
          </p>
          <h2 className="text-title text-ink">
            신청이
            <br />
            정상적으로 접수됐어요.
          </h2>
          <p className="text-body text-muted">이제 담당자 검토가 시작됩니다.</p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="text-muted text-[12px] leading-[18px]">접수번호</p>
          <p className="text-ink text-[18px] leading-[26px] font-semibold">
            {application.data.id} · {application.data.request.applicantName}
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-label text-ink">신청 내용</h3>
          <dl className="flex flex-col gap-3 text-[13px] leading-[22px]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted shrink-0">{label}</dt>
                <dd className="text-ink text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex gap-3">
          <span className="bg-page text-ink flex h-6 w-9 shrink-0 items-center justify-center rounded-full">
            <FileText size={18} aria-hidden />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-muted text-[13px] leading-[22px]">다음 단계</p>
            <p className="text-ink text-[15px] leading-[22px] font-semibold">
              행정 검토가 진행돼요.
            </p>
            <p className="text-muted text-[13px] leading-[22px]">
              지원 조건과 제출한 서류를 확인한 뒤
              <br />
              결과를 알려드릴게요.
            </p>
          </div>
        </section>
      </div>
    </Screen>
  );
}
