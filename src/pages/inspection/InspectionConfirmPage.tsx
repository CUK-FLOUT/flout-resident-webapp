import { useEffect, useRef, useState } from 'react';
import { generatePath, Navigate, useNavigate } from 'react-router';
import { getInspectionReceipt, useInspectionSubmission } from '@/api/applications';
import { Screen } from '@/components/layout';
import { Button, ProgressBar } from '@/components/ui';
import {
  TENURE_LABEL,
  VISIT_TIME_LABEL,
  WATER_ENTRY_OPTIONS,
  YES_NO_UNKNOWN_OPTIONS,
} from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';
import { getPrimaryAddress } from '@/lib/address';
import { samePhotos, step1Error, step2Error } from '@/lib/inspection';
import { useAddressDraft } from '@/stores/addressDraft';
import { useInspectionDraft } from '@/stores/inspectionDraft';

export default function InspectionConfirmPage() {
  const navigate = useNavigate();
  const { createDraft, updateMockDraft, uploadPhotos } = useInspectionSubmission();
  const draft = useInspectionDraft();
  const result = useAddressDraft((s) => s.result);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  if (!result) return <Navigate to={PATHS.addressSearch} replace />;
  if (draft.assessmentId !== result.id) return <Navigate to={PATHS.inspectionApply} replace />;
  if (step1Error(draft)) return <Navigate to={PATHS.inspectionApply} replace />;
  if (step2Error(draft)) return <Navigate to={PATHS.inspectionSchedule} replace />;
  const input = result.input;
  const address = getPrimaryAddress(input.address);
  const submit = async () => {
    if (busy.current) return;
    const current = useInspectionDraft.getState();
    if (current.submitting) return;
    const validation = step1Error(current) ?? step2Error(current);
    if (validation) {
      setError(validation);
      return;
    }
    if (
      !address.trim() ||
      !input.detail.trim() ||
      !Number.isFinite(input.coordinates.latitude) ||
      !Number.isFinite(input.coordinates.longitude)
    ) {
      setError('주소와 좌표를 다시 확인해 주세요.');
      return;
    }
    const assessmentId: string | number = result.id;
    if (
      !env.useMock &&
      (result.source === 'mock' ||
        typeof assessmentId !== 'number' ||
        !Number.isSafeInteger(assessmentId) ||
        assessmentId <= 0)
    ) {
      setError('실제 취약도 분석 ID가 아직 준비되지 않아 신청할 수 없어요.');
      return;
    }
    const payload = {
      assessmentId,
      address,
      detailAddress: input.detail.trim(),
      latitude: input.coordinates.latitude,
      longitude: input.coordinates.longitude,
      contact: current.phone.trim(),
      applicantName: current.applicantName.trim(),
      occupancyType: current.tenure === 'OTHER' ? ('ETC' as const) : current.tenure!,
      floodExperience: current.floodExperience!,
      existingFacility: current.facilityInstalled!,
      requestReason: current.reason.trim() || undefined,
      preferredVisitDate: current.preferredDate,
      preferredTimeSlot:
        current.preferredTimeSlot === 'ANYTIME' ? ('ANY' as const) : current.preferredTimeSlot!,
      inflowLocations: current.waterEntryPoints.map((v) => (v === 'OTHER' ? ('ETC' as const) : v)),
    };
    const serialized = JSON.stringify(payload);
    if (!env.useMock && current.savedApplicationId && current.savedPayload !== serialized) {
      setError('임시 저장된 신청 정보와 달라요. 기존 입력값으로 되돌린 뒤 다시 시도해 주세요.');
      return;
    }
    busy.current = true;
    current.update({ submitting: true });
    setPending(true);
    setError('');
    try {
      let applicationId = current.savedApplicationId;
      if (!applicationId) {
        const created = await createDraft.mutateAsync(payload);
        if (
          !Number.isSafeInteger(created.applicationId) ||
          created.applicationId <= 0 ||
          created.status !== 'DRAFT'
        )
          throw new Error('임시 신청 상태를 확인하지 못했어요.');
        if (
          useAddressDraft.getState().result?.id !== result.id ||
          useInspectionDraft.getState().assessmentId !== result.id
        )
          return;
        applicationId = created.applicationId;
        current.update({
          savedApplicationId: applicationId,
          savedReceiptNo: created.receiptNo,
          savedPayload: serialized,
        });
      } else if (current.savedPayload !== serialized) {
        await updateMockDraft.mutateAsync({ applicationId, input: payload });
        if (useInspectionDraft.getState().assessmentId !== result.id) return;
        current.update({ savedPayload: serialized });
      }
      const state = useInspectionDraft.getState();
      const sameFiles = await samePhotos(state.uploadedPhotos, state.photos);
      const uploadKey =
        sameFiles && state.uploadKey
          ? state.uploadKey
          : (globalThis.crypto?.randomUUID?.() ??
            `inspection-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      if (state.uploadResult && !sameFiles)
        throw new Error(
          '사진 등록이 완료된 신청이에요. 기존 사진으로 접수 상태를 다시 확인해 주세요.',
        );
      state.update({ uploadKey, uploadedPhotos: [...state.photos] });
      const uploaded =
        state.uploadResult ??
        (await uploadPhotos.mutateAsync({
          applicationId,
          files: state.photos,
          requestKey: uploadKey,
        }));
      if (!uploaded.inspectionId || !uploaded.attachments?.length)
        throw new Error('사진 등록 결과를 확인하지 못했어요.');
      if (useInspectionDraft.getState().assessmentId === result.id)
        useInspectionDraft.getState().update({ uploadResult: uploaded });
      const receipt = await getInspectionReceipt(applicationId);
      if (
        receipt.applicationStatus !== 'RECEIVED' &&
        receipt.applicationStatus !== 'INSPECTION_COMPLETED'
      )
        throw new Error('아직 접수가 확인되지 않았어요. 다시 시도해 주세요.');
      const completedDraft = useInspectionDraft.getState();
      if (
        completedDraft.assessmentId === result.id &&
        completedDraft.savedApplicationId === applicationId
      )
        completedDraft.reset();
      if (active.current && useAddressDraft.getState().result?.id === result.id)
        navigate(generatePath(PATHS.inspectionComplete, { applicationId: String(applicationId) }), {
          replace: true,
        });
    } catch (e) {
      if (active.current)
        setError(e instanceof Error ? e.message : '신청하지 못했어요. 다시 시도해 주세요.');
    } finally {
      busy.current = false;
      if (useInspectionDraft.getState().assessmentId === result.id)
        useInspectionDraft.getState().update({ submitting: false });
      if (active.current) setPending(false);
    }
  };
  const applicantRows = [
    ['신청자', draft.applicantName],
    ['연락처', draft.phone],
    ['거주 형태', draft.tenure ? TENURE_LABEL[draft.tenure] : ''],
  ];
  const housingRows = [
    [
      '과거 침수 경험',
      YES_NO_UNKNOWN_OPTIONS.find((v) => v.value === draft.floodExperience)?.label ?? '',
    ],
    [
      '물 유입 위치',
      draft.waterEntryPoints
        .map((v) => WATER_ENTRY_OPTIONS.find((item) => item.value === v)?.label)
        .join(' · ') || '선택하지 않음',
    ],
    ['기존 침수방지시설', draft.facilityInstalled ? '있음' : '없음'],
  ];
  const scheduleRows = [
    ['희망 방문일', draft.preferredDate],
    ['방문 가능 시간', draft.preferredTimeSlot ? VISIT_TIME_LABEL[draft.preferredTimeSlot] : ''],
  ];
  return (
    <Screen
      header={{ title: '신청 정보 확인', onBack: () => navigate(PATHS.inspectionSchedule) }}
      tab="home"
      bottom={
        <>
          {error && (
            <p role="alert" className="text-body text-danger">
              {error}
            </p>
          )}
          <Button
            loading={pending || draft.submitting}
            loadingText="신청 중…"
            onClick={() => void submit()}
          >
            신청하기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 pt-4">
        <div>
          <p className="text-caption">최종 확인</p>
          <h1 className="text-title mt-2">
            신청 전에 입력한 내용을
            <br />
            확인해 주세요.
          </h1>
          <ProgressBar className="mt-3" value={3} max={3} label="신청 3 / 3" />
        </div>
        <section>
          <h2 className="text-heading">신청자 정보</h2>
          <dl className="mt-2 flex flex-col gap-2">
            {applicantRows.map(([label, value]) => (
              <div key={label} className="text-body flex justify-between gap-4">
                <dt className="shrink-0">{label}</dt>
                <dd className="text-label min-w-0 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="text-heading">점검 대상 주소</h2>
          <p className="text-section mt-2 font-semibold">{address}</p>
          {input.detail.trim() && <p className="text-body mt-1">{input.detail}</p>}
        </section>
        {[
          { title: '주택 상황', rows: housingRows },
          { title: '방문 가능 일정', rows: scheduleRows },
        ].map(({ title, rows }) => (
          <section key={title}>
            <h2 className="text-heading">{title}</h2>
            <dl className="mt-2 flex flex-col gap-2">
              {rows.map(([label, value]) => (
                <div key={label} className="text-body flex justify-between gap-4">
                  <dt className="shrink-0">{label}</dt>
                  <dd className="text-label min-w-0 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section>
          <h2 className="text-heading">점검 요청 사유</h2>
          <p className="text-body mt-2 whitespace-pre-wrap">{draft.reason.trim() || '없음'}</p>
        </section>
      </div>
    </Screen>
  );
}
