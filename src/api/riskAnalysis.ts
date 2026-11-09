import { useMutation, useQuery } from '@tanstack/react-query';
import type { AddressCoordinates, AddressSearchItem } from '@/api/risk';
import { mockDelay } from '@/api/mocks';
import { queryKeys } from '@/api/queryClient';
import { getPrimaryAddress } from '@/lib/address';
import { env } from '@/lib/env';
import { ApiError, http } from '@/lib/http';
import { tokenStorage } from '@/lib/storage';
import type { ResidenceFloor } from '@/stores/addressDraft';
import type { RiskLevel } from '@/types/domain';

export interface AnalysisInput {
  address: AddressSearchItem;
  coordinates: AddressCoordinates;
  detail: string;
  floor: ResidenceFloor;
}

const housingTypes = {
  BASEMENT: 'SEMI_BASEMENT',
  FIRST: 'FIRST_FLOOR',
  SECOND_OR_ABOVE: 'SECOND_FLOOR_OR_ABOVE',
} as const satisfies Record<ResidenceFloor, string>;

type HousingType = (typeof housingTypes)[ResidenceFloor];

export type RiskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface RiskDetails {
  reasons: string[];
  floodRecord?: string;
  disclaimer?: string;
}

type AnalysisOutcome =
  | (RiskDetails & { status: 'COMPLETED'; level: RiskLevel })
  | { status: Exclude<RiskStatus, 'COMPLETED'> };

type CompletedAnalysis = Extract<AnalysisOutcome, { status: 'COMPLETED' }>;

type AnalysisIdentity = { source: 'mock'; id: string } | { source: 'api'; id: number };

export type AnalysisResult = CompletedAnalysis & AnalysisIdentity & { input: AnalysisInput };

type AnalysisCreation = AnalysisIdentity & AnalysisOutcome;

type AssessmentDetail = AnalysisOutcome & {
  address: string;
  detailAddress: string;
  floor: ResidenceFloor | null;
};

interface Envelope<T> {
  isSuccess: boolean;
  status: number;
  message: string;
  code: string;
  result: T;
}

interface CreateRiskAssessmentResponse {
  assessmentId: number;
  status: RiskStatus;
  riskLevel?: RiskLevel;
  riskType?: string;
  cellId?: string;
  score?: number;
  reasons?: string[];
  floodRecord?: string;
  disclaimer?: string;
}

function unwrap<T>(response: Envelope<T> | null): T {
  if (!response?.isSuccess || response.result == null)
    throw new ApiError(
      response?.isSuccess ? 502 : (response?.status ?? 502),
      response?.isSuccess
        ? '분석 결과를 확인할 수 없어요.'
        : response?.message || '분석 요청을 처리하지 못했어요.',
      response?.code,
    );
  return response.result;
}

export function parseAssessmentId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function readResidenceFloor(housingType: HousingType | null | undefined): ResidenceFloor | null {
  switch (housingType) {
    case housingTypes.BASEMENT:
      return 'BASEMENT';
    case housingTypes.FIRST:
      return 'FIRST';
    case housingTypes.SECOND_OR_ABOVE:
      return 'SECOND_OR_ABOVE';
    default:
      return null;
  }
}

function readOutcome(status: unknown, level: unknown, details: unknown): AnalysisOutcome {
  if (status === 'PENDING' || status === 'PROCESSING' || status === 'FAILED') return { status };
  if (status !== 'COMPLETED' || (level !== 'HIGH' && level !== 'CAUTION' && level !== 'LOW'))
    throw new ApiError(502, '분석 상태 또는 취약도 등급을 확인할 수 없어요.');
  const values =
    typeof details === 'object' && details !== null ? (details as Partial<RiskDetails>) : {};
  return {
    status,
    level,
    reasons: Array.isArray(values.reasons)
      ? values.reasons.filter((value) => typeof value === 'string' && value.trim())
      : [],
    floodRecord: typeof values.floodRecord === 'string' ? values.floodRecord.trim() : undefined,
    disclaimer: typeof values.disclaimer === 'string' ? values.disclaimer.trim() : undefined,
  };
}

export async function analyzeRisk(
  input: AnalysisInput,
  level: RiskLevel,
): Promise<AnalysisCreation> {
  const address = getPrimaryAddress(input.address).trim();
  const detailAddress = input.detail.trim();
  if (!address || !detailAddress || address.length > 255 || detailAddress.length > 255)
    throw new ApiError(400, '주소와 상세 주소를 각각 255자 이내로 입력해 주세요.');

  if (env.useMock) {
    await mockDelay();
    return {
      id: 'mock-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      level,
      status: 'COMPLETED',
      source: 'mock',
      reasons: [],
    };
  }

  const response = unwrap(
    await http.post<Envelope<CreateRiskAssessmentResponse>>('/resident/risk-assessments', {
      address,
      detailAddress,
      housingType: housingTypes[input.floor],
    }),
  );
  if (!Number.isSafeInteger(response.assessmentId) || response.assessmentId <= 0)
    throw new ApiError(502, '분석 결과 번호를 확인할 수 없어요.');
  return {
    source: 'api',
    id: response.assessmentId,
    ...readOutcome(response.status, response.riskLevel, response),
  };
}

export async function getRiskAssessment(
  id: number,
  signal?: AbortSignal,
): Promise<AssessmentDetail> {
  const response = unwrap(
    await http.get<
      Envelope<{
        assessmentId: number;
        address: string;
        detailAddress: string;
        status: string;
        riskLevel: string | null;
        housingType?: HousingType | null;
        result: unknown;
      }>
    >('/resident/risk-assessments/' + id, { signal }),
  );
  if (
    response.assessmentId !== id ||
    typeof response.address !== 'string' ||
    !response.address.trim() ||
    typeof response.detailAddress !== 'string'
  )
    throw new ApiError(502, '저장된 분석 결과를 확인할 수 없어요.');
  return {
    ...readOutcome(response.status, response.riskLevel, response.result),
    address: response.address,
    detailAddress: response.detailAddress,
    floor: readResidenceFloor(response.housingType),
  };
}

export function useRiskAnalysis() {
  return useMutation({
    mutationFn: ({ input, level }: { input: AnalysisInput; level: RiskLevel }) =>
      analyzeRisk(input, level),
    retry: false,
  });
}

export function useRiskAssessment(id: number | null) {
  return useQuery({
    queryKey: [...queryKeys.assessment(String(id)), tokenStorage.readSession()?.id],
    queryFn: ({ signal }) => getRiskAssessment(id!, signal),
    enabled: !env.useMock && id !== null,
    retry: false,
    refetchInterval: ({ state }) =>
      !state.error && (state.data?.status === 'PENDING' || state.data?.status === 'PROCESSING')
        ? 3000
        : false,
  });
}
