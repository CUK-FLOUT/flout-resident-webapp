import type { Draft } from '@/stores/inspectionDraft';

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const INVALID_PHONE_MESSAGE = '올바른 연락처를 입력해 주세요.';
export const PHONE_TOO_LONG_MESSAGE = '연락처의 숫자가 너무 많아요. 번호를 확인해 주세요.';

export function formatInspectionPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  const prefixLength = digits.startsWith('02') ? 2 : 3;
  if (digits.length <= prefixLength) return digits;
  if (digits.length <= prefixLength + 4)
    return `${digits.slice(0, prefixLength)}-${digits.slice(prefixLength)}`;
  return `${digits.slice(0, prefixLength)}-${digits.slice(prefixLength, -4)}-${digits.slice(-4)}`;
}

export function inspectionPhoneError(value: string): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length > (digits.startsWith('02') ? 10 : 11)) return PHONE_TOO_LONG_MESSAGE;
  return isValidInspectionPhone(value) ? null : INVALID_PHONE_MESSAGE;
}

export function isValidInspectionPhone(value: string): boolean {
  return /^0(?:10|11|16|17|18|19|2|31|32|33|41|42|43|44|51|52|53|54|55|61|62|63|64)-\d{3,4}-\d{4}$/.test(
    value,
  );
}
/** 재선택된 파일도 실제 내용이 같을 때만 이전 업로드 요청으로 취급합니다. */
export async function samePhotos(previous: File[], current: File[]): Promise<boolean> {
  if (previous.length !== current.length) return false;
  for (let i = 0; i < current.length; i += 1) {
    const a = previous[i];
    const b = current[i];
    if (a === b) continue;
    if (a.name !== b.name || a.size !== b.size || a.type !== b.type) return false;
    for (let offset = 0; offset < a.size; offset += 1024 * 1024) {
      const [left, right] = await Promise.all([
        a.slice(offset, offset + 1024 * 1024).arrayBuffer(),
        b.slice(offset, offset + 1024 * 1024).arrayBuffer(),
      ]);
      const l = new Uint8Array(left);
      const r = new Uint8Array(right);
      if (l.some((value, index) => value !== r[index])) return false;
    }
  }
  return true;
}
export function photoError(files: File[]): string | null {
  if (files.length > 5) return '사진은 최대 5장까지 등록할 수 있어요.';
  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file.name) || !['image/jpeg', 'image/png'].includes(file.type))
      return 'JPG, JPEG 또는 PNG 사진만 등록할 수 있어요.';
    if (file.size > MAX_PHOTO_BYTES) return '사진 한 장의 크기는 15MB 이하여야 해요.';
  }
  return null;
}
export function step1Error(draft: Draft): string | null {
  if (!draft.applicantName.trim()) return '신청자 이름을 입력해 주세요.';
  if (!draft.phone.trim()) return '연락처를 입력해 주세요.';
  const phoneError = inspectionPhoneError(draft.phone);
  if (phoneError) return phoneError;
  if (!draft.tenure) return '거주 형태를 선택해 주세요.';
  if (!draft.floodExperience) return '과거 침수 경험을 선택해 주세요.';
  if (draft.facilityInstalled === null) return '기존 침수방지시설 여부를 선택해 주세요.';
  return null;
}
export function step2Error(draft: Draft): string | null {
  if (!draft.photos.length) return '사진을 최소 1장 등록해 주세요.';
  const invalid = photoError(draft.photos);
  if (invalid) return invalid;
  const today = new Date().toLocaleDateString('sv-SE');
  const date = new Date(`${draft.preferredDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.preferredDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== draft.preferredDate ||
    draft.preferredDate < today
  )
    return '오늘 이후의 희망 방문일을 선택해 주세요.';
  if (!draft.preferredTimeSlot) return '방문 가능 시간을 선택해 주세요.';
  return null;
}
