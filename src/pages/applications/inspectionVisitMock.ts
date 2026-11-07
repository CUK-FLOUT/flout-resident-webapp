/** 방문 상태 화면 전용 목업. API 요청이나 기존 신청 데이터 변경 없이 표시합니다. */
export const inspectionVisitMock = {
  date: '2026.10.12',
  monthDay: '10.12',
  year: '2026년',
  weekday: '월요일',
  time: '14:00',
  timeLabel: '오후 2:00',
  address: '부천시 ○○구 ○○로 00',
  status: '점검 예정',
  preparation: '방문 전 배수구 주변을 정리해 주세요',
} as const;
