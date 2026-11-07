import clearSpace from '@/assets/inspection-visit/clear-space.png';
import floodPhoto from '@/assets/inspection-visit/flood-photo.png';
import existingFacilities from '@/assets/inspection-visit/existing-facilities.png';
import { getVisitDateTime } from '@/lib/inspectionApplication';
import { InspectionApplicationScreen } from './InspectionApplicationScreen';

const preparations = [
  {
    image: clearSpace,
    title: '점검할 공간을 비워주세요',
    description: '출입구, 창문, 배수구 주변을 확인할 수 있도록 물건이 있다면 잠시 옮겨주세요.',
  },
  {
    image: floodPhoto,
    title: '이전 침수 사진이 있다면 보여주세요',
    description:
      '사진이 없어도 괜찮아요. 기억나는 침수 상황이나 물이 들어왔던 위치를 설명해 주셔도 돼요.',
  },
  {
    image: existingFacilities,
    title: '기존 침수방지시설도 함께 확인해요',
    description: '이미 설치된 침수 방지 시설의 상태와 정상 작동 여부도 함께 점검해요.',
  },
];

export default function VisitPreparePage() {
  return (
    <InspectionApplicationScreen title="방문 전 안내" backTo="visit">
      {(detail) => {
        const visit = detail.progress?.visit;
        const dateTime = getVisitDateTime(visit?.scheduledAt);
        return (
          <div className="flex flex-col gap-6 py-5">
            <section className="flex flex-col gap-2">
              <h2 className="text-title">방문 전 준비</h2>
              <p className="text-body text-muted">
                전문가가 현장을 정확하게 확인할 수 있도록
                <br />
                점검할 공간만 간단히 준비해 주세요.
              </p>
            </section>
            <section
              aria-label="예정 방문 일정"
              className="border-border flex flex-col gap-1 border-b pb-4"
            >
              <p className="text-primary text-[18px] leading-[26px] font-semibold">
                {dateTime ? `${dateTime.date} · ${dateTime.time}` : '방문 일정 미정'}
              </p>
              <p className="text-muted text-[12px] leading-[18px]">
                {detail.inspectionStatus === 'SCHEDULED' ? '예정 방문' : '방문 일정'}
              </p>
              <p className="text-caption">담당자 · {visit?.inspectorName?.trim() || '미배정'}</p>
              <p className="text-caption whitespace-pre-line">
                방문 전 안내 · {visit?.preVisitNotice?.trim() || '등록된 안내 없음'}
              </p>
            </section>
            <ul aria-label="방문 전 준비사항" className="flex flex-col gap-6">
              {preparations.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-md object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h3 className="text-[15px] leading-6 font-semibold">{item.title}</h3>
                    <p className="text-muted text-[13px] leading-[22px]">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <section className="border-border flex flex-col gap-2 border-t pt-[18px]">
              <h3 className="text-label">예방시설은 점검 후 결정돼요</h3>
              <p className="text-muted text-[13px] leading-[22px]">
                방문 전에는 실제 물 유입 위치나 필요한 시설을 확정하지 않아요. 전문가가 현장을
                확인한 뒤 적절한 예방조치를 안내합니다.
              </p>
            </section>
          </div>
        );
      }}
    </InspectionApplicationScreen>
  );
}
