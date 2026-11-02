import type { AddressSearchItem } from '@/api/risk';

/** 도로명주소가 없을 때만 지번주소를 대표 주소로 사용합니다. */
export function getPrimaryAddress(address: AddressSearchItem): string {
  return address.roadAddress?.trim() ? address.roadAddress : (address.jibunAddress ?? '');
}
