import { TENURE_LABEL, WATER_ENTRY_OPTIONS, YES_NO_UNKNOWN_OPTIONS } from '@/constants/labels';
import { formatDate } from '@/lib/date';
import {
  getInspectionAddress,
  getInspectionStatusLabel,
  getPreferredVisitTime,
} from '@/lib/inspectionApplication';
import { maskPhone } from '@/lib/phone';
import { InspectionApplicationScreen } from './InspectionApplicationScreen';

export default function ApplicationInfoPage() {
  return (
    <InspectionApplicationScreen title="점검 신청 내역" backTo="applicationHub">
      {(detail) => {
        const inflow = detail.inflowLocations
          ?.map(
            (value) =>
              WATER_ENTRY_OPTIONS.find((item) => item.value === (value === 'ETC' ? 'OTHER' : value))
                ?.label,
          )
          .filter(Boolean)
          .join(' · ');
        const tenure =
          TENURE_LABEL[detail.occupancyType === 'ETC' ? 'OTHER' : detail.occupancyType];
        const flood = YES_NO_UNKNOWN_OPTIONS.find(
          (item) => item.value === detail.floodExperience,
        )?.label;
        const phone = detail.applicant?.phone?.trim();
        const fields = [
          ['접수번호 / 현재 상태', `${detail.receiptNumber} / ${getInspectionStatusLabel(detail)}`],
          [
            '신청자 / 연락처',
            `${detail.applicant?.name?.trim() || '정보 없음'} / ${phone ? maskPhone(phone) : '정보 없음'}`,
          ],
          ['주소 / 거주 형태', `${getInspectionAddress(detail)} / ${tenure ?? '정보 없음'}`],
          ['과거 침수 / 유입 위치', `${flood ?? '정보 없음'} / ${inflow || '정보 없음'}`],
          [
            '기존 시설 / 첨부 사진',
            `${typeof detail.existingFacility === 'boolean' ? (detail.existingFacility ? '있음' : '없음') : '정보 없음'} / ${typeof detail.attachmentCount === 'number' ? `${detail.attachmentCount}장` : '정보 없음'}`,
          ],
          [
            '희망 방문일 / 방문 가능 시간',
            `${detail.preferredVisitDate ? formatDate(detail.preferredVisitDate) : '미정'} / ${getPreferredVisitTime(detail.preferredTimeSlot)}`,
          ],
          ['점검 요청 사유', detail.requestReason?.trim() || '요청 사유 없음'],
        ] as const;
        return (
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
        );
      }}
    </InspectionApplicationScreen>
  );
}
