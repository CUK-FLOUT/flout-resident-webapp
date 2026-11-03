import { create } from 'zustand';
import type {
  InspectionUploadResponse,
  Tenure,
  VisitTimeSlot,
  WaterEntryPoint,
  YesNoUnknown,
} from '@/types/domain';

/**
 * 현장점검 신청 3단계 폼(03 → 03-2 → 03-3)의 작성 중 상태.
 * 단계 화면 간 이동해도 입력값이 유지되고, 제출/취소(INSPECTION-10) 시 reset 합니다.
 * 새로고침 시 사진 File 객체는 보존할 수 없어 persist 하지 않았습니다.
 */
export interface Draft {
  assessmentId?: string;
  address: string;
  applicantName: string;
  phone: string;
  tenure: Tenure | null;
  floodExperience: YesNoUnknown | null;
  waterEntryPoints: WaterEntryPoint[];
  photos: File[];
  reason: string;
  facilityInstalled: boolean | null;
  savedApplicationId: number | null;
  savedReceiptNo: string;
  savedPayload: string;
  uploadKey: string;
  uploadedPhotos: File[];
  uploadResult: InspectionUploadResponse | null;
  submitting: boolean;
  preferredDate: string;
  preferredTimeSlot: VisitTimeSlot | null;
}

interface InspectionDraftState extends Draft {
  update: (patch: Partial<Draft>) => void;
  reset: () => void;
}

const initial: Draft = {
  assessmentId: undefined,
  address: '',
  applicantName: '',
  phone: '',
  tenure: null,
  floodExperience: null,
  waterEntryPoints: [],
  photos: [],
  reason: '',
  facilityInstalled: null,
  savedApplicationId: null,
  savedReceiptNo: '',
  savedPayload: '',
  uploadKey: '',
  uploadedPhotos: [],
  uploadResult: null,
  submitting: false,
  preferredDate: '',
  preferredTimeSlot: null,
};

export const useInspectionDraft = create<InspectionDraftState>()((set) => ({
  ...initial,
  update: (patch) => set(patch),
  reset: () => set(initial),
}));
