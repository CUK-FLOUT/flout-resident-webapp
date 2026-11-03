import { create } from 'zustand';
import type { AddressCoordinates, AddressSearchItem } from '@/api/risk';
import type { AnalysisResult, MockRiskLevel } from '@/api/riskAnalysis';

export type ResidenceFloor = 'BASEMENT' | 'FIRST' | 'SECOND_OR_ABOVE';

interface AddressDraftState {
  address: AddressSearchItem | null;
  coordinates: AddressCoordinates | null;
  detail: string;
  floor: ResidenceFloor | null;
  result: AnalysisResult | null;
  mockLevel: MockRiskLevel;
  setResult: (result: AnalysisResult | null) => void;
  setMockLevel: (level: MockRiskLevel) => void;
  searchKeyword: string;
  searchRevision: number;
  searchScrollY: number;
  selectAddress: (address: AddressSearchItem, coordinates: AddressCoordinates) => void;
  setDetail: (detail: string) => void;
  setFloor: (floor: ResidenceFloor) => void;
  setSearchKeyword: (keyword: string) => void;
  setSearchScrollY: (scrollY: number) => void;
  startNewSearch: () => void;
}

/** 다음 단계에서 읽을 주소 입력 초안. 새로고침 시 초기화됩니다. */
export const useAddressDraft = create<AddressDraftState>()((set) => ({
  address: null,
  coordinates: null,
  detail: '',
  floor: null,
  searchKeyword: '',
  result: null,
  mockLevel: 'HIGH',
  setResult: (result) => set({ result }),
  setMockLevel: (mockLevel) => set({ mockLevel, result: null }),
  searchRevision: 0,
  searchScrollY: 0,
  selectAddress: (address, coordinates) =>
    set((state) => {
      const same =
        state.address?.roadAddress === address.roadAddress &&
        state.address?.jibunAddress === address.jibunAddress &&
        state.address?.zipCode === address.zipCode;
      return same
        ? { address, coordinates, result: null }
        : { address, coordinates, detail: '', floor: null, result: null };
    }),
  setDetail: (detail) => set({ detail, result: null }),
  setFloor: (floor) => set({ floor, result: null }),
  setSearchKeyword: (keyword) =>
    set((state) =>
      keyword === state.searchKeyword
        ? state
        : { searchKeyword: keyword, searchRevision: state.searchRevision + 1, searchScrollY: 0 },
    ),
  setSearchScrollY: (searchScrollY) => set({ searchScrollY }),
  startNewSearch: () =>
    set((state) => ({
      address: null,
      coordinates: null,
      detail: '',
      floor: null,
      searchKeyword: '',
      result: null,
      searchRevision: state.searchRevision + 1,
      searchScrollY: 0,
    })),
}));
