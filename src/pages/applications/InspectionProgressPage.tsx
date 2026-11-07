import inspectionIllustration from '@/assets/inspection-visit/inspection-progress.svg';
import { getInspectionAddress, getInspectionStatusLabel } from '@/lib/inspectionApplication';
import { InspectionApplicationScreen } from './InspectionApplicationScreen';

export default function InspectionProgressPage() {
  return (
    <InspectionApplicationScreen title="현장점검하기" backTo="applicationHub">
      {(detail) => {
        const inProgress = detail.inspectionStatus === 'IN_PROGRESS';
        const status = getInspectionStatusLabel(detail);
        return (
          <div className="flex flex-col gap-[18px] pt-5 pb-6">
            <section className="flex flex-col gap-2">
              <p className="text-caption flex items-center gap-2">
                <span aria-hidden className="bg-success size-2 rounded-sm" />
                {status}
              </p>
              <h2 className="text-title">
                {inProgress ? (
                  <>
                    현장 점검을
                    <br />
                    진행하고 있어요.
                  </>
                ) : (
                  status
                )}
              </h2>
              {inProgress && (
                <p className="text-body">작업이 끝나면 점검 결과와 현장 사진을 확인할 수 있어요.</p>
              )}
            </section>
            {inProgress && (
              <section
                aria-label="현재 점검 작업"
                className="bg-page relative min-h-[156px] overflow-hidden rounded-md p-4"
              >
                <div className="text-caption relative z-10 flex w-[140px] max-w-full flex-col gap-1">
                  <h3>현재 작업</h3>
                  <p>세부 작업 정보는 제공되지 않아요.</p>
                </div>
                <img
                  src={inspectionIllustration}
                  alt="전문가가 배수구를 점검하는 모습"
                  width={180}
                  height={135}
                  className="absolute top-2.5 right-2.5"
                />
              </section>
            )}
            <section className="flex flex-col gap-1.5">
              <h3 className="text-caption">주민 요청 사유</h3>
              <p className="text-section">{detail.requestReason?.trim() || '요청 사유 없음'}</p>
            </section>
            <hr className="border-page border-t" />
            <section className="flex flex-col gap-1">
              <h3 className="text-caption">접수번호 / 주소</h3>
              <p className="text-body">
                {detail.receiptNumber} · {detail.applicant?.name?.trim() || '신청자 정보 없음'} /{' '}
                {getInspectionAddress(detail)}
              </p>
            </section>
          </div>
        );
      }}
    </InspectionApplicationScreen>
  );
}
