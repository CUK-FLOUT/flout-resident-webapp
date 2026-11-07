import { useState } from 'react';
import { generatePath, Navigate, useParams } from 'react-router';
import {
  useInspectionApplication,
  useRecommendedFacilities,
  useSupportPrograms,
} from '@/api/applications';
import radioChecked from '@/assets/support/radio-checked.svg';
import radioUnchecked from '@/assets/support/radio-unchecked.svg';
import { Screen, StateMessage } from '@/components/layout';
import { Button, ChoiceGroup, TextField } from '@/components/ui';
import { TENURE_LABEL, VISIT_TIME_OPTIONS } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { maskPhone } from '@/lib/phone';
import { useSupportDraft } from '@/stores/supportDraft';
import type { InspectionApplicationDetail, SupportProgram, VisitTimeSlot } from '@/types/domain';

export default function SupportApplyPage() {
  const { applicationId } = useParams<'applicationId'>();
  const application = useInspectionApplication(applicationId);
  const programs = useSupportPrograms(applicationId);
  const recommended = useRecommendedFacilities(applicationId);
  const header = { title: '지원하기' };
  const queries = [application, programs, recommended];
  const program = programs.data?.[0];

  if (queries.some((q) => q.isLoading)) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>신청 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!application.data || !program || !recommended.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          <Button onClick={() => queries.forEach((q) => q.isError && q.refetch())}>
            다시 시도
          </Button>
        }
      >
        <StateMessage>신청 정보를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  if (recommended.data.facilities.length === 0) {
    return <Navigate to={generatePath(PATHS.support, { applicationId: applicationId! })} replace />;
  }

  return (
    <ApplyForm
      applicationId={applicationId!}
      application={application.data}
      program={program}
      facilityOptions={recommended.data.facilities}
    />
  );
}

function ApplyForm({
  applicationId,
  application,
  program,
  facilityOptions,
}: {
  applicationId: string;
  application: InspectionApplicationDetail;
  program: SupportProgram;
  facilityOptions: string[];
}) {
  const { draft, setDraft } = useSupportDraft();
  const saved = draft?.applicationId === applicationId ? draft : null;
  const [selectedFacility, setSelectedFacility] = useState(saved?.facility ?? null);
  const [preferredDate, setPreferredDate] = useState(saved?.preferredDate ?? '');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<VisitTimeSlot | null>(
    saved?.preferredTimeSlot ?? null,
  );
  const autoAssigned = facilityOptions.length === 1;
  const facility = autoAssigned ? facilityOptions[0] : selectedFacility;
  const filled = facility && preferredDate && preferredTimeSlot;
  const { applicant, address, detailAddress, occupancyType } = application;

  return (
    <Screen
      header={{ title: '지원하기' }}
      tab="home"
      bottom={
        <Button
          disabled={!filled}
          onClick={() =>
            filled && setDraft({ applicationId, facility, preferredDate, preferredTimeSlot })
          }
        >
          다음으로
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pt-5 pb-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-title text-ink">지원 신청 정보를 확인해 주세요.</h2>
          <p className="text-body text-muted">신청자 정보와 희망 방문 일정을 확인해 주세요.</p>
        </section>

        <h3 className="text-section text-ink py-4">{program.name}</h3>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-label text-ink mb-1.5">설치 희망 시설</legend>
          <p className="text-caption text-muted">
            {autoAssigned ? (
              <>
                현장점검에서 권장된 설치 시설이 1개예요.
                <br />
                해당 시설로 자동 지정됩니다.
              </>
            ) : (
              '현장점검에서 권장된 설치 시설이에요. 해당 사업에서 지원 가능한 시설만 선택할 수 있어요.'
            )}
          </p>
          {autoAssigned && (
            <p className="bg-soft text-label text-ink mt-1.5 flex items-center gap-2 rounded-md p-4">
              <img src={radioChecked} alt="" width={20} height={20} className="shrink-0" />
              {facility}
            </p>
          )}
          {!autoAssigned && (
            <>
              <div className="flex flex-col">
                {facilityOptions.map((option) => (
                  <label key={option} className="flex h-11 cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="facility"
                      className="peer sr-only"
                      checked={facility === option}
                      onChange={() => setSelectedFacility(option)}
                    />
                    <img
                      src={facility === option ? radioChecked : radioUnchecked}
                      alt=""
                      width={20}
                      height={20}
                      className="peer-focus-visible:outline-primary shrink-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                    />
                    <span className="text-label text-ink">{option}</span>
                  </label>
                ))}
              </div>
              {facility && (
                <div className="bg-soft text-ink flex flex-col gap-1 rounded-md p-4">
                  <p className="text-caption">선택한 시설</p>
                  <p className="text-section">{facility}</p>
                </div>
              )}
            </>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <TextField size="md" label="이름" value={applicant.name} readOnly />
          <TextField size="md" label="연락처" value={maskPhone(applicant.phone)} readOnly />
        </div>
        <TextField
          size="md"
          label="주소"
          value={detailAddress ? `${address} ${detailAddress}` : address}
          readOnly
        />
        <TextField
          size="md"
          label="거주 형태"
          value={TENURE_LABEL[occupancyType === 'ETC' ? 'OTHER' : occupancyType]}
          readOnly
        />
        <TextField
          size="md"
          type="date"
          label="희망 방문일"
          value={preferredDate}
          min={new Date().toLocaleDateString('sv-SE')}
          onChange={(e) => setPreferredDate(e.target.value)}
          helperText="실제 방문일은 배정 후 확정돼요."
        />
        <ChoiceGroup
          label="방문 가능 시간"
          options={VISIT_TIME_OPTIONS}
          value={preferredTimeSlot}
          onChange={setPreferredTimeSlot}
          className="[&>p]:text-label"
        />
      </div>
    </Screen>
  );
}
