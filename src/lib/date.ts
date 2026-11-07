/**
 * API 날짜(ISO 8601, KST 오프셋 포함 또는 YYYY-MM-DD) 표시용.
 * 문자열 앞 10자리를 그대로 쓰므로 타임존 변환이 없습니다.
 */
export const formatDate = (iso: string) => iso.slice(0, 10).replaceAll('-', '.'); // 2026.10.07

/** 2026-10-21T14:30:00+09:00 → 오후 2:30 */
export const formatTime = (iso: string) => {
  const [h, m] = iso.slice(11, 16).split(':').map(Number);
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
};

export const joinDateTime = (date: string | null, time: string | null) =>
  date && time ? `${date}T${time}` : null;

export const formatWeekday = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(iso.slice(0, 10)),
  );

export const formatMonthDay = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${m}월 ${d}일`; // 10월 7일
};
