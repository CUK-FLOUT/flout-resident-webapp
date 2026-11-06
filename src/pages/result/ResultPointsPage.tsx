import { useRef, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { resultMock } from './resultMock';

/**
 * Figma: 03-13 현장점검하기_취약점 (1115:3140)
 * 기능명세: RESULT-03, RESULT-04
 */
export default function ResultPointsPage() {
  const { applicationId = '000001' } = useParams<'applicationId'>();
  const navigate = useNavigate();
  const gallery = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  return (
    <InspectionStatusScreen
      title="취약점"
      backTo={generatePath(PATHS.result, { applicationId })}
      bottom={
        <Button
          onClick={() => navigate(generatePath(PATHS.resultRecommendations, { applicationId }))}
        >
          권장 예방조치 보기
        </Button>
      }
    >
      <div className="flex flex-col gap-[18px] py-5">
        <section className="flex flex-col gap-1.5">
          <p className="text-label">취약지점 · 출입구 / 배수구</p>
          <h2 className="text-title">확인된 취약지점을 살펴보세요.</h2>
          <p className="text-body">
            {applicationId} · {resultMock.applicant} · {resultMock.address}
            <br />
            취약지점별 전문가 설명과 현장사진을 확인해 주세요.
          </p>
        </section>
        <section aria-label="현장점검 사진" className="flex flex-col gap-2">
          <div
            ref={gallery}
            className="flex h-[180px] snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
            onScroll={(event) => {
              const element = event.currentTarget;
              setSelected(Math.round(element.scrollLeft / (element.clientWidth + 12)));
            }}
          >
            {resultMock.photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.src}
                alt={photo.label}
                className="h-[180px] w-full shrink-0 snap-start rounded-lg object-cover"
              />
            ))}
          </div>
          <p className="text-[12px] leading-5">현장점검 사진 · {resultMock.photos.length}장</p>
          <div className="flex gap-3">
            {resultMock.photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                aria-label={photo.label}
                aria-pressed={selected === index}
                className="h-13 w-[72px] shrink-0 rounded-lg"
                onClick={() => {
                  gallery.current?.scrollTo({
                    left: index * (gallery.current.clientWidth + 12),
                    behavior: 'smooth',
                  });
                }}
              >
                <img
                  src={photo.src}
                  alt=""
                  width={72}
                  height={52}
                  className="h-13 w-[72px] rounded-lg object-cover"
                />
              </button>
            ))}
          </div>
        </section>
        <div className="flex flex-col gap-4">
          {resultMock.points.map((point, index) => (
            <section
              key={point.location}
              className="border-border flex flex-col gap-4 rounded-lg border p-4"
            >
              <h3 className="text-caption text-primary font-bold">
                취약지점 {String(index + 1).padStart(2, '0')}: {point.location}
              </h3>
              <p className="text-section">{point.type}</p>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[13px] leading-[22px] font-bold">전문가 의견</h4>
                <p className="text-body">{point.opinion}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[13px] leading-[22px] font-bold">현장 확인 내용</h4>
                <p className="text-body">{point.observation}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </InspectionStatusScreen>
  );
}
