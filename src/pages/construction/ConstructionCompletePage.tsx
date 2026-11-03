import placeholderPhoto from '@/assets/construction-result-placeholder.png';
import { formatDate, formatTime } from '@/lib/date';
import { ConstructionScreen, InfoField } from './ConstructionScreen';

export default function ConstructionCompletePage() {
  return (
    <ConstructionScreen>
      {({ construction, application: { id, request } }) => {
        const { facility, location, resultNote, scheduledAt, completedAt } = construction;
        const photoDate = completedAt ?? scheduledAt;

        return (
          <>
            <section className="flex flex-col gap-3">
              <p className="text-caption text-primary flex items-center gap-2">
                <span aria-hidden className="bg-primary h-1.5 w-8 rounded-full" />
                전체 완료
              </p>
              <h2 className="text-title">
                예방시설 설치가
                <br />
                모두 끝났어요.
              </h2>
              <p className="text-body">현장에 설치된 시설과 최종 결과를 확인해 주세요.</p>
            </section>

            <figure className="bg-page relative h-[205px] overflow-hidden rounded-lg">
              <img
                src={construction.resultPhotoUrls[0] ?? placeholderPhoto}
                alt={`${facility} 설치 현장 사진`}
                className="size-full object-cover"
              />
              <span className="bg-surface text-caption text-primary absolute top-3 left-3 rounded-md px-2.5 py-1">
                설치 완료
              </span>
              {photoDate && (
                <figcaption className="text-label text-body-text absolute bottom-3 left-3">
                  {formatDate(photoDate)} · 현장 등록 사진
                </figcaption>
              )}
            </figure>

            <section className="flex flex-col gap-2">
              <p className="text-caption">시공 결과</p>
              <p className="text-section text-primary">{facility} 설치 완료</p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="text-caption">설치 확인</p>
              <dl className="text-caption flex flex-col gap-3">
                {[
                  ['설치 위치', location],
                  ['예방조치', `${facility} 설치`],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                <div className="flex justify-between gap-4">
                  <dt>시공 상태</dt>
                  <dd className="text-primary flex items-center gap-1.5">
                    <span aria-hidden className="bg-primary size-1.5 rounded-full" />
                    시공 완료
                  </dd>
                </div>
              </dl>
            </section>

            <InfoField label="접수번호 / 주소">
              {id} · {request.applicantName} / {request.address}
            </InfoField>
            <InfoField label="최종 설치 결과">
              {facility} 설치{resultNote && ` · ${resultNote}`}
            </InfoField>
            <InfoField label="처리 상태">
              <span className="text-primary">전체 완료</span>
            </InfoField>
            {scheduledAt && (
              <InfoField label="시공일 / 방문 시간">
                {formatDate(scheduledAt)} / {formatTime(scheduledAt)}
              </InfoField>
            )}
          </>
        );
      }}
    </ConstructionScreen>
  );
}
