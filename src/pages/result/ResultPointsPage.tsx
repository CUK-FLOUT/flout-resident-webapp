import { useRef, useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { inspectionVulnerabilityLabel } from '@/api/inspectionResults';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getInspectionAddress } from '@/lib/inspectionApplication';
import { InspectionStatusScreen } from '@/pages/inspection/InspectionStatusScreen';
import { PublishedResultScreen, type PublishedResultProps } from './ResultApplicationScreen';

/**
 * Figma: 03-13 현장점검하기_취약점 (1115:3140)
 * 기능명세: RESULT-03, RESULT-04
 */
export default function ResultPointsPage() {
  return (
    <PublishedResultScreen title="취약점" backTo="result">
      {(props) => <ResultPoints key={props.applicationId} {...props} />}
    </PublishedResultScreen>
  );
}

function ResultPoints({ title, backTo, application, applicationId, result }: PublishedResultProps) {
  const navigate = useNavigate();
  const gallery = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const types = [
    ...new Set(result.vulnerabilities.map(({ type }) => inspectionVulnerabilityLabel[type])),
  ];
  return (
    <InspectionStatusScreen
      title={title}
      backTo={backTo}
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
          <p className="text-label">취약지점{types.length > 0 && ` · ${types.join(' / ')}`}</p>
          <h2 className="text-title">확인된 취약지점을 살펴보세요.</h2>
          <p className="text-body">
            {application.receiptNumber} · {application.applicant.name} ·{' '}
            {getInspectionAddress(application)}
            <br />
            취약지점별 전문가 설명과 현장사진을 확인해 주세요.
          </p>
        </section>
        <section aria-label="현장점검 사진" className="flex flex-col gap-2">
          {result.photos.length === 0 ? (
            <p className="text-body text-muted">등록된 현장점검 사진이 없어요.</p>
          ) : (
            <>
              <div
                ref={gallery}
                className="flex h-[180px] snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
                onScroll={(event) => {
                  const element = event.currentTarget;
                  setSelected(Math.round(element.scrollLeft / (element.clientWidth + 12)));
                }}
              >
                {result.photos.map((photo, index) => (
                  <img
                    key={photo.photoId}
                    src={photo.url}
                    alt={`현장점검 사진 ${index + 1}`}
                    className="h-[180px] w-full shrink-0 snap-start rounded-lg object-cover"
                  />
                ))}
              </div>
              <p className="text-[12px] leading-5">현장점검 사진 · {result.photos.length}장</p>
              <div className="flex min-w-0 gap-3 overflow-x-auto">
                {result.photos.map((photo, index) => (
                  <button
                    key={photo.photoId}
                    type="button"
                    aria-label={`현장점검 사진 ${index + 1}`}
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
                      src={photo.url}
                      alt=""
                      width={72}
                      height={52}
                      className="h-13 w-[72px] rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
        <div className="flex flex-col gap-4">
          {result.vulnerabilities.length === 0 && (
            <p className="text-body text-muted">등록된 취약지점이 없어요.</p>
          )}
          {result.vulnerabilities.map((point, index) => (
            <section
              key={`${point.type}-${index}`}
              className="border-border flex flex-col gap-4 rounded-lg border p-4"
            >
              <h3 className="text-caption text-primary font-bold">
                취약지점 {String(index + 1).padStart(2, '0')}:{' '}
                {inspectionVulnerabilityLabel[point.type]}
              </h3>
              <p className="text-section">{point.title}</p>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[13px] leading-[22px] font-bold">전문가 의견</h4>
                <p className="text-body">{point.expertOpinion || '등록된 전문가 의견이 없어요.'}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[13px] leading-[22px] font-bold">현장 확인 내용</h4>
                <p className="text-body">
                  {point.fieldFindings || '등록된 현장 확인 내용이 없어요.'}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </InspectionStatusScreen>
  );
}
