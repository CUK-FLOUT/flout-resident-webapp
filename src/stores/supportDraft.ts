import { create } from 'zustand';
import type { VisitTimeSlot } from '@/types/domain';

export interface SupportDraft {
  applicationId: string;
  facility: string;
  preferredDate: string;
  preferredTimeSlot: VisitTimeSlot;
  supportApplicationId?: number;
  formDraftId?: string;
}

interface SupportDraftState {
  draft: SupportDraft | null;
  setDraft: (draft: SupportDraft | null) => void;
}

export const useSupportDraft = create<SupportDraftState>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
}));
