import { generatePath, useParams } from 'react-router';
import inspectionIllustration from '@/assets/inspection-visit/inspection-progress.svg';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';

/** Figma: 03-10 현장점검하기_점검진행 (2215:2458). UI 전용 목업입니다. */
const progress = {
  status: '점검 진행',
  currentWork: '화장실 · 배수구',
  reason: '최근 배수구 역류가 있어 점검을 희망합니다.',
  applicant: '박○○',
  address: '○○로 24',
};

export default function InspectionProgressPage() {
  const { applicationId = '000001' } = useParams<'applicationId'>();

  return (
    <InspectionStatusScreen
      title="현장점검하기"
      backTo={generatePath(PATHS.visit, { applicationId })}
    >
      <div className="flex flex-col gap-[18px] pt-5 pb-6">
        <section className="flex flex-col gap-2">
          <p className="text-caption flex items-center gap-2">
            <span aria-hidden className="bg-success size-2 rounded-sm" />
            {progress.status}
          </p>
          <h2 className="text-title">
            현장 점검을
            <br />
            진행하고 있어요.
          </h2>
          <p className="text-body">작업이 끝나면 점검 결과와 현장 사진을 확인할 수 있어요.</p>
        </section>
        <section
          aria-label="현재 점검 작업"
          className="bg-page relative min-h-[156px] overflow-hidden rounded-md p-4"
        >
          <div className="text-caption relative z-10 flex w-[140px] max-w-full flex-col gap-1">
            <h3>현재 작업</h3>
            <p>{progress.currentWork}</p>
          </div>
          <img
            src={inspectionIllustration}
            alt="전문가가 배수구를 점검하는 모습"
            width={180}
            height={135}
            className="absolute top-2.5 right-2.5"
          />
        </section>
        <section className="flex flex-col gap-1.5">
          <h3 className="text-caption">주민 요청 사유</h3>
          <p className="text-section">{progress.reason}</p>
        </section>
        <hr className="border-page border-t" />
        <section className="flex flex-col gap-1">
          <h3 className="text-caption">접수번호 / 주소</h3>
          <p className="text-body">
            {applicationId} · {progress.applicant} / {progress.address}
          </p>
        </section>
      </div>
    </InspectionStatusScreen>
  );
}
