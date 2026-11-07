import { useConstructionResult } from '@/api/applications';
import illustration from '@/assets/construction-progress.svg';
import { ConstructionScreen, InfoField } from './ConstructionScreen';

export default function ConstructionProgressPage() {
  return (
    <ConstructionScreen status="IN_PROGRESS" useDetail={useConstructionResult}>
      {({ requestedFacility: facility, receiptNo, applicantName, address }) => (
        <>
          <section className="flex flex-col gap-2">
            <p className="text-caption flex items-center gap-2">
              <span aria-hidden className="bg-success size-2 rounded-full" />
              시공 진행
            </p>
            <h2 className="text-title">
              {facility}을
              <br />
              설치하고 있어요.
            </h2>
            <p className="text-body">작업이 끝나면 설치 결과와 현장 사진을 확인할 수 있어요.</p>
          </section>

          <section className="bg-page relative h-[156px] overflow-hidden rounded-md p-4">
            <p className="text-caption flex flex-col gap-1">
              <span>현재 작업</span>
              <span>{facility} 설치</span>
            </p>
            <img
              src={illustration}
              alt=""
              width={180}
              height={135}
              className="absolute top-2.5 right-2.5"
            />
          </section>

          <section className="flex flex-col gap-1.5">
            <p className="text-caption">시공 진행 중</p>
            <p className="text-section">{facility} 설치를 진행하고 있어요.</p>
          </section>

          <div aria-hidden className="bg-page h-px" />

          <InfoField label="접수번호 / 주소">
            {receiptNo} · {applicantName} / {address}
          </InfoField>
        </>
      )}
    </ConstructionScreen>
  );
}
