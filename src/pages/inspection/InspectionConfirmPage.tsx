import { useEffect, useRef, useState } from 'react';
import { generatePath, Navigate, useLocation, useNavigate } from 'react-router';
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
import { ApiError } from '@/lib/http';
import { inspectionPhotoRequestKey, samePhotos, step1Error, step2Error } from '@/lib/inspection';
import {
  inspectionFormFields,
  inspectionSessionScope,
  recoverInspectionCreation,
  rememberInspection,
  saveInspectionProgress,
} from '@/lib/inspectionForm';
import { useInspectionDraft } from '@/stores/inspectionDraft';

const isReceived = (status: string) => status === 'RECEIVED' || status === 'INSPECTION_COMPLETED';

export default function InspectionConfirmPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const applyPath = { pathname: PATHS.inspectionApply, search };
  const schedulePath = { pathname: PATHS.inspectionSchedule, search };
  const { createDraft, updateMockDraft, uploadPhotos } = useInspectionSubmission();
  const draft = useInspectionDraft();
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
  if (!draft.context || draft.sessionScope !== inspectionSessionScope())
    return <Navigate to={applyPath} replace />;
  if (step1Error(draft)) return <Navigate to={applyPath} replace />;
  if (step2Error(draft)) return <Navigate to={schedulePath} replace />;
  const context = draft.context;
  const address = context.address;
  const submit = async () => {
    if (busy.current) return;
    const current = useInspectionDraft.getState();
    if (current.submitting || current.context !== context) return;
    const validation = step1Error(current) ?? step2Error(current);
    if (validation) {
      setError(validation);
      return;
    }
    const assessmentId = current.assessmentId;
    if (
      assessmentId === undefined ||
      (!env.useMock &&
        (typeof assessmentId !== 'number' ||
          !Number.isSafeInteger(assessmentId) ||
          assessmentId <= 0))
    ) {
      setError('실제 취약도 분석 ID가 아직 준비되지 않아 신청할 수 없어요.');
      return;
    }
    if (
      !address.trim() ||
      address.length > 255 ||
      !context.detailAddress.trim() ||
      context.detailAddress.length > 255 ||
      !Number.isFinite(context.latitude) ||
      Math.abs(context.latitude) > 90 ||
      !Number.isFinite(context.longitude) ||
      Math.abs(context.longitude) > 180
    ) {
      setError('주소와 좌표를 다시 확인해 주세요.');
      return;
    }
    const fields = inspectionFormFields(current);
    const payload = {
      ...fields,
      ...context,
      assessmentId,
      contact: fields.contact.trim(),
      applicantName: fields.applicantName.trim(),
      occupancyType: fields.occupancyType!,
      floodExperience: fields.floodExperience!,
      existingFacility: fields.existingFacility!,
      preferredTimeSlot: fields.preferredTimeSlot!,
      requestReason: fields.requestReason?.trim() || undefined,
    };
    const serialized = JSON.stringify(fields);
    const isCurrent = () =>
      useInspectionDraft.getState().context === context &&
      current.sessionScope === inspectionSessionScope();
    const complete = (applicationId: number) => {
      if (!isCurrent()) return;
      current.update({ savedApplicationId: applicationId, creationPending: false });
      if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId);
      if (active.current)
        navigate(generatePath(PATHS.inspectionComplete, { applicationId: String(applicationId) }), {
          replace: true,
        });
    };
    busy.current = true;
    current.update({ submitting: true });
    setPending(true);
    setError('');
    try {
      let applicationId = current.savedApplicationId;
      if (
        !env.useMock &&
        typeof assessmentId === 'number' &&
        current.creationPending &&
        current.formId
      ) {
        const application = await recoverInspectionCreation(assessmentId, current.formId);
        if (!isCurrent()) return;
        if (application && isReceived(application.applicationStatus)) {
          complete(application.applicationId);
          return;
        }
        applicationId = application?.applicationId ?? applicationId;
        current.update({ savedApplicationId: applicationId, creationPending: false });
        if (applicationId) rememberInspection(assessmentId, applicationId);
      }
      if (!env.useMock && applicationId) {
        const receipt = await getInspectionReceipt(applicationId);
        if (!isCurrent()) return;
        if (isReceived(receipt.applicationStatus)) {
          complete(applicationId);
          return;
        }
        if (receipt.applicationStatus !== 'DRAFT')
          throw new Error('임시 저장 상태의 신청만 수정할 수 있어요.');
      }
      await saveInspectionProgress();
      if (!isCurrent()) return;
      if (!applicationId) {
        const formDraftId = useInspectionDraft.getState().formId ?? undefined;
        if (!env.useMock && !formDraftId) throw new Error('임시 저장된 신청서를 확인할 수 없어요.');
        if (!env.useMock) current.update({ creationPending: true });
        const created = await createDraft.mutateAsync({ input: payload, formDraftId });
        if (!Number.isSafeInteger(created.applicationId) || created.applicationId <= 0)
          throw new Error('임시 신청 상태를 확인하지 못했어요.');
        if (!isCurrent()) return;
        applicationId = created.applicationId;
        if (isReceived(created.status)) {
          complete(applicationId);
          return;
        }
        if (created.status !== 'DRAFT') throw new Error('임시 신청 상태를 확인하지 못했어요.');
        current.update({
          savedApplicationId: applicationId,
          savedPayload: serialized,
          creationPending: false,
        });
        if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId);
      } else if (env.useMock && current.savedPayload !== serialized) {
        await updateMockDraft.mutateAsync({ applicationId, input: payload });
        if (!isCurrent()) return;
        current.update({ savedPayload: serialized });
      }

      const state = useInspectionDraft.getState();
      const files = current.photos;
      const sameFiles = env.useMock && (await samePhotos(state.uploadedPhotos, files));
      const uploadKey = env.useMock
        ? sameFiles && state.uploadKey
          ? state.uploadKey
          : crypto.randomUUID()
        : await inspectionPhotoRequestKey(files);
      if (!isCurrent()) return;
      if (state.uploadKey && state.uploadKey !== uploadKey && (!env.useMock || state.uploadResult))
        throw new Error('이전 사진의 등록 상태를 확인해야 해요. 같은 사진으로 다시 시도해 주세요.');
      state.update({ uploadKey, uploadedPhotos: files });
      if (typeof assessmentId === 'number')
        rememberInspection(assessmentId, applicationId, uploadKey);
      let uploaded = state.uploadResult;
      if (!uploaded) {
        try {
          uploaded = await uploadPhotos.mutateAsync({
            applicationId,
            files,
            requestKey: uploadKey,
          });
        } catch (failure) {
          if (
            isCurrent() &&
            failure instanceof ApiError &&
            (failure.code === 'APPLICATION_500_2' ||
              (failure.status >= 400 && failure.status < 500 && failure.status !== 409))
          ) {
            state.update({ uploadKey: '', uploadedPhotos: [] });
            if (typeof assessmentId === 'number') rememberInspection(assessmentId, applicationId);
          }
          throw failure;
        }
      }
      if (!uploaded.inspectionId || !uploaded.attachments?.length)
        throw new Error('사진 등록 결과를 확인하지 못했어요.');
      if (!isCurrent()) return;
      current.update({ uploadResult: uploaded });
      const receipt = await getInspectionReceipt(applicationId);
      if (!isReceived(receipt.applicationStatus))
        throw new Error('아직 접수가 확인되지 않았어요. 다시 시도해 주세요.');
      complete(applicationId);
    } catch (failure) {
      if (
        isCurrent() &&
        failure instanceof ApiError &&
        failure.status >= 400 &&
        failure.status < 500 &&
        failure.status !== 409
      )
        current.update({ creationPending: false });
      if (active.current)
        setError(
          failure instanceof Error ? failure.message : '신청하지 못했어요. 다시 시도해 주세요.',
        );
    } finally {
      busy.current = false;
      if (isCurrent()) current.update({ submitting: false });
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
      header={{ title: '신청 정보 확인', onBack: () => navigate(schedulePath) }}
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
          {context.detailAddress.trim() && (
            <p className="text-body mt-1">{context.detailAddress}</p>
          )}
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
