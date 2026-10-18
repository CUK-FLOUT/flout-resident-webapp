import { create } from 'zustand';
import type {
  ExistingFacility,
  InspectionRequestInput,
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
interface Draft {
  assessmentId?: string;
  address: string;
  applicantName: string;
  phone: string;
  tenure: Tenure | null;
  floodExperience: YesNoUnknown | null;
  waterEntryPoints: WaterEntryPoint[];
  photos: File[];
  existingFacility: ExistingFacility;
  reason: string;
  preferredDate: string;
  preferredTimeSlot: VisitTimeSlot | null;
}

interface InspectionDraftState extends Draft {
  update: (patch: Partial<Draft>) => void;
  reset: () => void;
  /** 1단계(주택 상황) 필수값 입력 여부 */
  isStep1Valid: () => boolean;
  /** 2단계(방문 희망일) 필수값 입력 여부 */
  isStep2Valid: () => boolean;
  /** 제출용 payload. 필수값이 비어 있으면 null */
  toInput: () => InspectionRequestInput | null;
}

const initial: Draft = {
  address: '',
  applicantName: '',
  phone: '',
  tenure: null,
  floodExperience: null,
  waterEntryPoints: [],
  photos: [],
  existingFacility: 'NONE',
  reason: '',
  preferredDate: '',
  preferredTimeSlot: null,
};

export const useInspectionDraft = create<InspectionDraftState>()((set, get) => ({
  ...initial,
  update: (patch) => set(patch),
  reset: () => set(initial),
  isStep1Valid: () => {
    const s = get();
    return Boolean(
      s.applicantName && s.phone && s.tenure && s.floodExperience && s.waterEntryPoints.length,
    );
  },
  isStep2Valid: () => {
    const s = get();
    return Boolean(s.preferredDate && s.preferredTimeSlot);
  },
  toInput: () => {
    const s = get();
    if (!s.isStep1Valid() || !s.isStep2Valid()) return null;
    return {
      assessmentId: s.assessmentId,
      address: s.address,
      applicantName: s.applicantName,
      phone: s.phone,
      tenure: s.tenure!,
      floodExperience: s.floodExperience!,
      waterEntryPoints: s.waterEntryPoints,
      photos: s.photos,
      existingFacility: s.existingFacility,
      reason: s.reason || undefined,
      preferredDate: s.preferredDate,
      preferredTimeSlot: s.preferredTimeSlot!,
    };
  },
}));
