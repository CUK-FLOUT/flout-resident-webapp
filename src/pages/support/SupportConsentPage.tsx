import { ArrowRight, Download, FileText } from 'lucide-react';
import { useSubmitConsentFile } from '@/api/applications';
import { StepProgress } from '@/components/ui';
import { CONSENT_STATUS_LABEL, SUPPORT_STEPS, TENURE_LABEL } from '@/constants/labels';
import type { ApplicationDetail, SupportProgress } from '@/types/domain';


const COPY = {
  tenant: {
    name: '임대인 동의',
    title: ['임대인 동의를', '기다리고 있어요.'],
    description: '이 신청은 임대인 동의 확인이 필요한 상태예요.',
    docTitle: '임대인 동의 확인',
    docDescription: '제출한 임대인 동의서를 담당자가 확인하면 결과가 반영돼요.',
    needTitle: '임대인 동의가 필요해요',
    needDescription: '서명받은 동의서를 PDF 또는 이미지로 첨부해 주세요.',
    fileLabel: '임대인 동의서 제출란 (파일선택)',
  },
  owner: {
    name: '주택 소유 여부',
    title: ['주택 소유 여부를', '확인하고 있어요.'],
    description: '이 신청은 주택 소유 확인이 필요한 상태예요.',
    docTitle: '주택 소유 여부 확인',
    docDescription: '제출한 주택 소유 증명서를 담당자가 확인하면 결과가 반영돼요.',
    needTitle: '주택 소유 증명이 필요해요',
    needDescription: '증명 서류를 PDF 또는 이미지로 첨부해 주세요.',
    fileLabel: '주택 소유 증명서 제출란 (파일선택)',
  },
};

export function ConsentView({
  progress,
  application,
}: {
  progress: SupportProgress;
  application: ApplicationDetail;
}) {
  const { id, request } = application;
  const copy = request.tenure === 'OWNER' ? COPY.owner : COPY.tenant;
  const consentLabel = CONSENT_STATUS_LABEL[progress.consent];

  return (
    <div className="text-ink flex flex-col gap-5 pt-5">
      <p className="text-label">
        {id} · {request.applicantName} · {request.address}
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="text-title">
          {copy.title[0]}
          <br />
          {copy.title[1]}
        </h2>
        <p className="text-body">
          {copy.description}
          <br />
          주민이 제출한 자료를 담당자가 확인하고 있어요.
        </p>
      </section>

      <StepProgress steps={SUPPORT_STEPS} current={2} />

      <section className="flex flex-col gap-4">
        <h3 className="text-label">현재 확인 상태</h3>
        <dl className="text-body flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <dt>행정 검토</dt>
            <dd className="text-label">{progress.decision === 'PENDING' ? '진행 중' : '완료'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{copy.name}</dt>
            <dd className="text-label">{consentLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center">
          <FileText size={20} aria-hidden />
        </span>
        <span className="flex flex-1 flex-col gap-1">
          <span className="text-label">{copy.docTitle}</span>
          <span className="text-body">{copy.docDescription}</span>
        </span>
        <span className="text-caption shrink-0 px-2 py-1">{consentLabel}</span>
      </section>

      {progress.consent === 'REQUIRED' ? (
        <UploadBlock applicationId={id} copy={copy} />
      ) : (
        <section className="bg-page flex flex-col gap-3 rounded-md p-4">
          <div className="flex flex-col gap-2">
            <p className="text-caption">{copy.name}</p>
            <p className="text-section">{progress.consentFile?.name ?? '제출 자료'} · 제출 완료</p>
            <p className="text-body">동의 상태: {consentLabel}</p>
          </div>
          {progress.consentFile && (
            <a
              href={progress.consentFile.url}
              download={progress.consentFile.name}
              target="_blank"
              rel="noreferrer"
              className="text-label flex items-center justify-between"
            >
              동의 자료 확인
              <Download size={16} aria-hidden className="text-primary" />
            </a>
          )}
        </section>
      )}

      <dl className="flex gap-2 px-4 py-2">
        <dt className="text-caption w-[152px] shrink-0">거주 형태 / 선택 시설</dt>
        <dd className="text-body">
          {TENURE_LABEL[request.tenure]} / {progress.facility}
        </dd>
      </dl>
    </div>
  );
}

function UploadBlock({
  applicationId,
  copy,
}: {
  applicationId: string;
  copy: (typeof COPY)['tenant'];
}) {
  const submit = useSubmitConsentFile(applicationId);

  return (
    <section className="bg-page flex flex-col gap-3 rounded-md p-4">
      <div className="flex flex-col gap-2">
        <p className="text-caption">{copy.name}</p>
        <p className="text-section">{copy.needTitle}</p>
        <p className="text-body">{copy.needDescription}</p>
      </div>
      <label className="text-label flex h-12 cursor-pointer items-center justify-between gap-2">
        {submit.isPending ? '올리는 중…' : copy.fileLabel}
        <ArrowRight size={16} aria-hidden className="text-primary" />
        <input
          type="file"
          accept="application/pdf,image/*"
          className="sr-only"
          disabled={submit.isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) submit.mutate(file);
            e.target.value = '';
          }}
        />
      </label>
      {submit.isError && (
        <p role="alert" className="text-caption text-danger">
          파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </section>
  );
}
