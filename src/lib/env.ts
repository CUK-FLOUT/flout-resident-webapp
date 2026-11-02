/** 환경변수는 이 파일을 통해서만 읽습니다. (.env.example 참고) */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  jusoApiKey: import.meta.env.VITE_JUSO_API_KEY ?? '',
  useMock: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true',
  isDev: import.meta.env.DEV,
} as const;
