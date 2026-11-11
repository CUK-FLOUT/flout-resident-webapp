import { useState, type ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generatePath, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import {
  parseInspectionApplicationId,
  useInspectionApplication,
  useSubmitSupport,
} from '@/api/applications';
import { queryKeys } from '@/api/queryClient';
import { getResidentProgress } from '@/api/residentProgress';
import arrowRight from '@/assets/support/arrow-right.svg';
import downloadIcon from '@/assets/support/download.svg';
import reviewNotice from '@/assets/support/review-notice.svg';
import { Screen, StateMessage } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { tokenStorage } from '@/lib/storage';
import { useSupportDraft, type SupportDraft } from '@/stores/supportDraft';
import type { InspectionApplicationDetail } from '@/types/domain';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE = /\.(pdf|jpe?g|png)$/i;

async function canUploadConsent(applicationId: number, supportId: number, signal: AbortSignal) {
  const visited = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await getResidentProgress({ cursor, signal });
    const item = page.items.find((entry) => entry.relatedIds?.applicationId === applicationId);
    if (item) {
      const targetId = item.nextAction?.target?.supportApplicationId;
      const relatedId = item.relatedIds.supportApplicationId;
      return (
        !item.closed &&
        item.currentStage === 'SUPPORT_DRAFT' &&
        item.nextAction?.type === 'UPLOAD_LANDLORD_CONSENT' &&
        (targetId ?? relatedId) === supportId &&
        (relatedId == null || relatedId === supportId)
      );
    }
    cursor = page.nextCursor ?? undefined;
    if (cursor) {
      if (visited.has(cursor)) return false;
      visited.add(cursor);
    }
  } while (cursor);
  return false;
}

export default function SupportSubmitPage() {
  const { applicationId } = useParams<'applicationId'>();
  const [searchParams] = useSearchParams();
  const requestedSupportId = searchParams.get('supportApplicationId');
  if (requestedSupportId !== null) {
    return (
      <ConsentEntry
        key={JSON.stringify([applicationId, requestedSupportId])}
        applicationId={parseInspectionApplicationId(applicationId)}
        supportId={parseInspectionApplicationId(requestedSupportId)}
      />
    );
  }
  return <NewSupportEntry applicationId={applicationId} />;
}

function ConsentEntry({
  applicationId,
  supportId,
}: {
  applicationId?: number;
  supportId?: number;
}) {
  const header = { title: '지원하기' };
  const application = useInspectionApplication(applicationId ? String(applicationId) : undefined);
  const target = useQuery({
    queryKey: queryKeys.supportConsentTarget(
      tokenStorage.readSession()?.id ?? null,
      applicationId ?? 0,
      supportId ?? 0,
    ),
    queryFn: ({ signal }) => canUploadConsent(applicationId!, supportId!, signal),
    enabled: Boolean(applicationId && supportId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: false,
  });

  if (application.isLoading || (!target.isFetchedAfterMount && target.isFetching)) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>신청 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }
  if (
    !applicationId ||
    !supportId ||
    target.isError ||
    application.isLoadingError ||
    target.data !== true ||
    application.data?.occupancyType !== 'TENANT'
  ) {
    const canRetry = target.isError || application.isLoadingError;
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          canRetry && (
            <Button
              onClick={() => {
                if (target.isError) void target.refetch();
                if (application.isLoadingError) void application.refetch();
              }}
            >
              다시 시도
            </Button>
          )
        }
      >
        <StateMessage>
          {canRetry
            ? '신청 정보를 불러오지 못했어요.'
            : '동의서를 등록할 수 있는 지원 신청을 확인하지 못했어요.'}
        </StateMessage>
      </Screen>
    );
  }

  return <SubmitForm application={application.data} submission={{ supportId }} />;
}

function NewSupportEntry({ applicationId }: { applicationId?: string }) {
  const draft = useSupportDraft((s) => s.draft);
  const application = useInspectionApplication(applicationId);
  const header = { title: '지원하기' };

  if (!draft || draft.applicationId !== applicationId) {
    return (
      <Navigate to={generatePath(PATHS.supportApply, { applicationId: applicationId! })} replace />
    );
  }

  if (application.isLoading) {
    return (
      <Screen header={header} tab="home">
        <StateMessage>신청 정보를 불러오고 있어요…</StateMessage>
      </Screen>
    );
  }

  if (!application.data) {
    return (
      <Screen
        header={header}
        tab="home"
        bottom={
          <Button onClick={() => application.refetch()}>다시 시도</Button>
        }
      >
        <StateMessage>신청 정보를 불러오지 못했어요.</StateMessage>
      </Screen>
    );
  }

  return <SubmitForm application={application.data} submission={{ draft }} />;
}

function SubmitForm({
  application,
  submission,
}: {
  application: InspectionApplicationDetail;
  submission: { draft: SupportDraft } | { supportId: number };
}) {
  const navigate = useNavigate();
  const setDraft = useSupportDraft((s) => s.setDraft);
  const submit = useSubmitSupport();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const isTenant = application.occupancyType === 'TENANT';
  const { receiptNumber, applicant, address } = application;

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;
    if (!ACCEPTED_FILE.test(selected.name)) {
      setFileError('PDF, JPG, PNG 파일만 첨부할 수 있어요.');
    } else if (selected.size > MAX_FILE_SIZE) {
      setFileError('파일은 최대 15MB까지 첨부할 수 있어요.');
    } else {
      setFileError('');
      setFile(selected);
    }
  };

  const downloadFile = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fileInput = (
    <input
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      className="sr-only"
      disabled={submit.isPending}
      onChange={selectFile}
    />
  );

  const draft = 'draft' in submission ? submission.draft : null;
  const goComplete = (supportApplicationId: number) =>
    navigate(
      `${generatePath(PATHS.supportComplete, { applicationId: draft?.applicationId ?? String(application.applicationId) })}?supportApplicationId=${supportApplicationId}`,
      { replace: true },
    );

  const onSubmit = () => {
    if ('supportId' in submission) {
      if (file)
        submit.mutate(
          { supportApplicationId: submission.supportId, file },
          { onSuccess: goComplete },
        );
      return;
    }
    const { draft } = submission;
    submit.mutate(
      {
        input: {
          applicationId: application.applicationId,
          programId: draft.programId,
          requestedFacility: draft.facility,
          preferredVisitDate: draft.preferredDate,
          preferredVisitTime: draft.preferredTimeSlot,
        },
        supportApplicationId: draft.supportApplicationId,
        formDraftId: draft.formDraftId,
        file,
        onCreated: (supportApplicationId) => setDraft({ ...draft, supportApplicationId }),
      },
      { onSuccess: goComplete },
    );
  };

  return (
    <Screen header={{ title: '지원하기' }} tab="home">
      <div className="text-ink flex flex-col gap-4 pt-5">
        <p className="text-label">
          {receiptNumber} · {applicant.name} · {address}
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="text-title">
            {isTenant ? '임대인 동의서를' : '동의서 없이'}
            <br />
            {isTenant ? '첨부해 주세요.' : '접수할 수 있어요.'}
          </h2>
          <p className="text-body">
            {isTenant ? '세입자는 서명받은 임대인 동의서를' : '소유자·기타는 임대인 동의서 없이'}
            <br />
            {isTenant ? '첨부해야 지원 신청을 접수할 수 있어요.' : '지원 신청을 접수할 수 있어요.'}
          </p>
        </section>

        <section className="bg-page flex flex-col gap-3 rounded-md p-4">
          <div className="flex flex-col gap-2">
            <p className="text-caption">임대인 동의서 · {isTenant ? '필수' : '불필요'}</p>
            <p className="text-section">
              {isTenant ? '서명받은 동의서가 필요해요' : '동의서를 제출하지 않아도 돼요'}
            </p>
            <p className="text-body">
              {isTenant ? 'PDF 또는 이미지 1개를 첨부해 주세요.' : '소유자·기타는 동의서 첨부 없이'}
              <br />
              {isTenant ? '파일은 최대 15MB까지 가능해요.' : '아래 버튼을 눌러 접수해 주세요.'}
            </p>
          </div>

          {!isTenant && <p className="text-label">별도 제출 서류 없음</p>}
          {isTenant && !file && (
            <label className="text-label flex cursor-pointer items-center justify-between gap-2">
              동의서 첨부하기
              <img src={arrowRight} alt="" width={16} height={16} className="shrink-0" />
              {fileInput}
            </label>
          )}
          {isTenant && file && (
            <div className="flex items-center justify-between gap-2">
              <label className="text-label min-w-0 flex-1 cursor-pointer break-all">
                {file.name}
                {fileInput}
              </label>
              <button
                type="button"
                aria-label={`${file.name} 내려받기`}
                onClick={downloadFile}
                className="flex shrink-0 items-center justify-center"
              >
                <img src={downloadIcon} alt="" width={16} height={16} />
              </button>
            </div>
          )}
          {fileError && (
            <p role="alert" className="text-caption text-danger">
              {fileError}
            </p>
          )}
        </section>

        <dl className="text-caption flex gap-2 px-4 py-2.5">
          <dt className="w-[116px] shrink-0">{draft ? '거주 형태 / 선택 시설' : '거주 형태'}</dt>
          <dd>
            {isTenant ? '세입자' : '소유자·기타'}
            {draft && ` / ${draft.facility}`}
          </dd>
        </dl>

        <p className="text-body flex items-center gap-2.5 p-3">
          <img src={reviewNotice} alt="" width={24} height={24} className="shrink-0" />
          <span>
            {isTenant ? '접수 후 담당자가 동의서와' : '접수 후 담당자가'}
            <br />
            지원 자격을 검토해요.
          </span>
        </p>

        {submit.isError && (
          <p role="alert" className="text-caption text-danger">
            {submit.error.message || '신청을 접수하지 못했어요. 잠시 후 다시 시도해 주세요.'}
          </p>
        )}
        <Button
          onClick={onSubmit}
          disabled={isTenant && !file}
          loading={submit.isPending}
          loadingText="접수하는 중…"
        >
          신청 접수하기
        </Button>
        <p className="text-center text-[12px] leading-[22px]">
          {isTenant
            ? '동의서 1개를 첨부하면 접수할 수 있어요.'
            : '입력한 내용을 확인한 뒤 접수해 주세요.'}
        </p>
      </div>
    </Screen>
  );
}
