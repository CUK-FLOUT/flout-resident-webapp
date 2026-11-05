/** Figma 03-6 / 03-7 기준 UI 전용 목업. API 및 신청 저장 데이터와 독립적입니다. */
export const inspectionStatusMock = {
  receiptNumber: '000001',
  status: '접수',
  applicant: '김○○',
  phone: '010-****-1234',
  address: '부천시 ○○구 ○○로 00',
  residenceType: '세입자',
  floodHistory: '있음',
  inflowLocation: '화장실 · 배수구',
  existingFacilities: '없음',
  photoCount: 2,
  preferredDate: '2026.09.07',
  preferredTime: '오전 9~12시',
  reason: '최근 배수구 역류가 있어 점검을 희망합니다.',
} as const;
