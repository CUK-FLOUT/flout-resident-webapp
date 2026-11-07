import { APPLICATION_STAGE, VISIT_TIME_LABEL } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { formatDate, formatTime, formatWeekday } from '@/lib/date';
import type { ApplicationStage, InspectionApplicationDetail } from '@/types/domain';

export function getApplicationListDestination(stage: ApplicationStage) {
  switch (stage) {
    case 'INSPECTION_RECEIVED':
    case 'VISIT_SCHEDULED':
    case 'INSPECTION_IN_PROGRESS':
    case 'INSPECTION_RESULT_PENDING':
      return PATHS.applicationHub;
    case 'INSPECTION_COMPLETED':
      return PATHS.result;
    default:
      return PATHS.applicationDetail;
  }
}

export function getInspectionStage(detail: InspectionApplicationDetail): ApplicationStage | null {
  if (detail.applicationStatus === 'DRAFT') return null;
  if (detail.inspectionStatus === 'SCHEDULED') return 'VISIT_SCHEDULED';
  if (detail.inspectionStatus === 'IN_PROGRESS') return 'INSPECTION_IN_PROGRESS';
  if (detail.progress?.stage) return detail.progress.stage;
  if (
    detail.inspectionStatus === 'COMPLETED' ||
    detail.applicationStatus === 'INSPECTION_COMPLETED'
  )
    return detail.resultPublished ? 'INSPECTION_COMPLETED' : 'INSPECTION_RESULT_PENDING';
  return 'INSPECTION_RECEIVED';
}

export function getInspectionStatusLabel(detail: InspectionApplicationDetail) {
  const stage = getInspectionStage(detail);
  if (stage === 'VISIT_SCHEDULED') return '점검 예정';
  return stage ? (APPLICATION_STAGE[stage]?.label ?? '상태 확인 중') : '임시 저장';
}

export function getInspectionAddress({ address, detailAddress }: InspectionApplicationDetail) {
  return [address, detailAddress].filter((part) => part?.trim()).join(' ') || '주소 정보 없음';
}

export function getPreferredVisitTime(slot: InspectionApplicationDetail['preferredTimeSlot']) {
  return slot ? (VISIT_TIME_LABEL[slot === 'ANY' ? 'ANYTIME' : slot] ?? '미정') : '미정';
}

export function getVisitDateTime(scheduledAt?: string | null) {
  if (
    !scheduledAt ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(scheduledAt) ||
    !Number.isFinite(Date.parse(scheduledAt))
  )
    return null;
  const date = formatDate(scheduledAt);
  return {
    date,
    monthDay: date.slice(5),
    year: scheduledAt.slice(0, 4),
    weekday: formatWeekday(scheduledAt),
    time: scheduledAt.slice(11, 16),
    timeLabel: formatTime(scheduledAt),
  };
}
