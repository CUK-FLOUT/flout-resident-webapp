import type {
  InspectionApplicationRequest,
  InspectionDraftResponse,
  InspectionReceipt,
  InspectionUploadResponse,
} from '@/types/domain';
import { mockDelay } from '@/api/mocks';
import { photoError } from '@/lib/inspection';

type MockRequest = Omit<InspectionApplicationRequest, 'assessmentId'> & { assessmentId: string };
type MockRecord = {
  request: MockRequest;
  receipt: InspectionReceipt;
  uploads: Record<string, { fingerprint: string; response: InspectionUploadResponse }>;
};
const key = 'flout.mockInspectionDrafts';
let memory: Record<string, MockRecord> = {};
function read(): Record<string, MockRecord> {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? (JSON.parse(stored) as Record<string, MockRecord>) : memory;
  } catch {
    return memory;
  }
}
function write(records: Record<string, MockRecord>) {
  memory = records;
  try {
    sessionStorage.setItem(key, JSON.stringify(records));
  } catch {
    /* 메모리 사용 */
  }
}

export async function createMockInspection(request: MockRequest): Promise<InspectionDraftResponse> {
  await mockDelay();
  const records = read();
  const existing = Object.values(records).find(
    (record) =>
      record.receipt.applicationStatus === 'DRAFT' &&
      record.request.assessmentId === request.assessmentId,
  );
  if (existing) {
    if (JSON.stringify(existing.request) !== JSON.stringify(request))
      throw new Error('기존 임시 신청과 입력 정보가 달라요.');
    return {
      applicationId: existing.receipt.applicationId,
      receiptNo: existing.receipt.receiptNumber,
      status: 'DRAFT',
      inspectionId: null,
      submittedAt: null,
    };
  }
  const applicationId = Math.max(0, ...Object.keys(records).map(Number)) + 1;
  const receiptNumber = String(applicationId).padStart(6, '0');
  records[applicationId] = {
    request,
    uploads: {},
    receipt: {
      applicationId,
      receiptNumber,
      applicant: { name: request.applicantName, phone: request.contact },
      address: request.address,
      detailAddress: request.detailAddress,
      applicationStatus: 'DRAFT',
      inspectionStatus: null,
      createdAt: new Date().toISOString(),
      submittedAt: null,
      attachmentCount: 0,
    },
  };
  write(records);
  return {
    applicationId,
    receiptNo: receiptNumber,
    status: 'DRAFT',
    inspectionId: null,
    submittedAt: null,
  };
}

/** Mock 전용 DRAFT 수정. 접수된 신청은 변경하지 않습니다. */
export async function updateMockInspection(
  applicationId: number,
  request: MockRequest,
): Promise<void> {
  await mockDelay();
  const records = read();
  const record = records[applicationId];
  if (!record || record.receipt.applicationStatus !== 'DRAFT')
    throw new Error('수정할 수 있는 임시 신청을 찾을 수 없어요.');
  if (record.request.assessmentId !== request.assessmentId)
    throw new Error('기존 임시 신청의 분석 정보가 달라요.');
  record.request = request;
  record.receipt.applicant = { name: request.applicantName, phone: request.contact };
  record.receipt.address = request.address;
  record.receipt.detailAddress = request.detailAddress;
  write(records);
}

export async function uploadMockInspection(
  applicationId: number,
  files: File[],
  requestKey: string,
): Promise<InspectionUploadResponse> {
  await mockDelay();
  const records = read();
  const record = records[applicationId];
  if (!record) throw new Error('임시 신청을 찾을 수 없어요.');
  const fingerprint = JSON.stringify(
    await Promise.all(
      files.map(async (file) => {
        let hash = 2166136261;
        for (let offset = 0; offset < file.size; offset += 1024 * 1024) {
          const bytes = new Uint8Array(
            await file.slice(offset, offset + 1024 * 1024).arrayBuffer(),
          );
          for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
        }
        return [file.name, file.size, file.type, hash];
      }),
    ),
  );
  const previous = record.uploads[requestKey];
  if (previous) {
    if (previous.fingerprint !== fingerprint)
      throw new Error('같은 요청 키에는 동일한 사진을 사용해야 해요.');
    return previous.response;
  }
  const invalid = photoError(files);
  if (!files.length || invalid || record.receipt.attachmentCount + files.length > 5)
    throw new Error(invalid ?? '사진은 1장 이상, 최대 5장까지 등록할 수 있어요.');
  const response = {
    inspectionId: applicationId,
    attachments: files.map((file, index) => ({
      attachmentId: record.receipt.attachmentCount + index + 1,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    })),
  };
  if (record.receipt.applicationStatus === 'DRAFT') {
    record.receipt.submittedAt = new Date().toLocaleString('sv-SE').replace(' ', 'T');
  }
  record.receipt.applicationStatus = 'RECEIVED';
  record.receipt.inspectionStatus = 'RECEIVED';
  record.receipt.attachmentCount += files.length;
  record.uploads[requestKey] = { fingerprint, response };
  write(records);
  return response;
}

export async function getMockInspection(applicationId: number): Promise<InspectionReceipt> {
  await mockDelay();
  const receipt = read()[applicationId]?.receipt;
  if (!receipt) throw new Error('신청 내역을 찾을 수 없어요.');
  return receipt;
}
