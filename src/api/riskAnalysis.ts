import { useMutation } from '@tanstack/react-query';
import type { AddressCoordinates, AddressSearchItem } from '@/api/risk';
import { mockDelay } from '@/api/mocks';
import { env } from '@/lib/env';
import type { ResidenceFloor } from '@/stores/addressDraft';

export type MockRiskLevel = 'HIGH' | 'CAUTION' | 'LOW';
export interface AnalysisInput {
  address: AddressSearchItem;
  coordinates: AddressCoordinates;
  detail: string;
  floor: ResidenceFloor;
}
export interface AnalysisResult {
  id: string;
  input: AnalysisInput;
  level: MockRiskLevel;
  source: 'mock';
}

/** TODO(백엔드): 확정된 분석 요청·응답, 결과 ID와 조회 API를 연결합니다. */
export async function analyzeRisk(
  input: AnalysisInput,
  level: MockRiskLevel,
): Promise<AnalysisResult> {
  if (!env.useMock) throw new Error('침수 취약도 분석 API가 아직 준비되지 않았어요.');
  await mockDelay();
  return {
    id: 'mock-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    input,
    level,
    source: 'mock',
  };
}

export function useRiskAnalysis() {
  return useMutation({
    mutationFn: ({ input, level }: { input: AnalysisInput; level: MockRiskLevel }) =>
      analyzeRisk(input, level),
  });
}
