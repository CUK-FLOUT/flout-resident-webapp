import { generatePath, useParams } from 'react-router';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { inspectionStatusMock as inspection } from '@/pages/inspection/inspectionStatusMock';

const fields = [
  ['접수번호 / 현재 상태', `${inspection.receiptNumber} / ${inspection.status}`],
  ['신청자 / 연락처', `${inspection.applicant} / ${inspection.phone}`],
  ['주소 / 거주 형태', `${inspection.address} / ${inspection.residenceType}`],
  ['과거 침수 / 유입 위치', `${inspection.floodHistory} / ${inspection.inflowLocation}`],
  ['기존 시설 / 첨부 사진', `${inspection.existingFacilities} / ${inspection.photoCount}장`],
  ['희망 방문일 / 방문 가능 시간', `${inspection.preferredDate} / ${inspection.preferredTime}`],
  ['점검 요청 사유', inspection.reason],
] as const;

export default function ApplicationInfoPage() {
  const { applicationId = inspection.receiptNumber } = useParams<'applicationId'>();

  return (
    <InspectionStatusScreen
      title="점검 신청 내역"
      backTo={generatePath(PATHS.applicationHub, { applicationId })}
    >
      <dl className="pt-2 pb-5">
        {fields.map(([label, value], index) => (
          <div
            key={label}
            className={`border-border flex flex-col gap-1.5 border-b py-4 last:border-b-0 ${index === 0 ? 'pt-3' : ''}`}
          >
            <dt className="text-caption text-muted">{label}</dt>
            <dd
              className={
                index === 0
                  ? 'text-primary text-[20px] leading-7 font-semibold'
                  : 'text-[15px] leading-6 font-medium'
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </InspectionStatusScreen>
  );
}
