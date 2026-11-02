/** 개발 서버에서 VITE_USE_MOCK=true일 때만 사용하는 테스트 설정. */
export const serviceAccessMock = {
  risk: 'NOT_STARTED' as 'NOT_STARTED' | 'COMPLETED',
  inspection: 'NOT_STARTED' as
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED_UNPUBLISHED'
    | 'COMPLETED_PUBLISHED',
  support: 'NOT_APPLIED' as 'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED',
  // 지원·시공 화면의 필수 라우트 파라미터를 위한 목업 전용 ID.
  applicationId: '000002',
};
