import { generatePath } from 'react-router';
import type { ResidentProgressItem } from '@/api/residentProgress';
import { PATHS } from '@/constants/paths';

type ProgressLink = { label: string; to: string | null };

function positiveId(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function formId(value: unknown) {
  return typeof value === 'string' && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value)
    ? value
    : null;
}

function matchId<T>(target: unknown, related: unknown, parse: (value: unknown) => T | null) {
  const a = parse(target);
  const b = parse(related);
  return a !== null && b !== null && a !== b ? null : (a ?? b);
}

function withParams(path: string, params: Record<string, string>) {
  return path + '?' + new URLSearchParams(params);
}

export function getProgressDestination(item: ResidentProgressItem): ProgressLink | null {
  const { currentStage, nextAction, relatedIds } = item;
  const target = nextAction?.target;
  const assessmentId = matchId(target?.assessmentId, item.assessmentId, positiveId);
  const applicationId = matchId(target?.applicationId, relatedIds?.applicationId, positiveId);
  const supportId = matchId(
    target?.supportApplicationId,
    relatedIds?.supportApplicationId,
    positiveId,
  );
  const constructionId = matchId(target?.constructionId, relatedIds?.constructionId, positiveId);
  const application = (path: string, label: string, allowed = true) => ({
    label,
    to:
      allowed && applicationId
        ? generatePath(path, { applicationId: String(applicationId) })
        : null,
  });
  const risk = (label: string) => ({
    label,
    to: assessmentId
      ? generatePath(PATHS.riskResult, { assessmentId: String(assessmentId) })
      : null,
  });

  switch (nextAction?.type) {
    case 'WAIT_FOR_ASSESSMENT':
      return risk('분석 현황 보기');
    case 'VIEW_ASSESSMENT':
      return risk('분석 결과 확인');
    case 'VIEW_GUIDE': {
      const guideId = matchId(target?.guideId, relatedIds?.guideId, positiveId);
      return {
        label: currentStage === 'GUIDE_IN_PROGRESS' ? '가이드 이어보기' : '가이드 보기',
        to:
          guideId && assessmentId
            ? withParams(generatePath(PATHS.guideLoading, { assessmentId: String(assessmentId) }), {
                guideId: String(guideId),
              })
            : null,
      };
    }
    case 'CONSIDER_INSPECTION':
      return {
        label: '현장점검 알아보기',
        to: assessmentId
          ? withParams(PATHS.inspectionApply, { assessmentId: String(assessmentId) })
          : null,
      };
    case 'CONTINUE_INSPECTION_FORM': {
      const id = matchId(target?.draftId, relatedIds?.inspectionFormDraftId, formId);
      return {
        label: '이어서 작성',
        to: id ? withParams(PATHS.inspectionApply, { inspectionFormDraftId: id }) : null,
      };
    }
    case 'UPLOAD_INSPECTION_PHOTO':
      return {
        label: '사진 등록',
        to:
          assessmentId && applicationId
            ? withParams(PATHS.inspectionApply, {
                assessmentId: String(assessmentId),
                applicationId: String(applicationId),
                step: 'photos',
              })
            : null,
      };
    case 'WAIT_FOR_VISIT_SCHEDULE':
      return application(PATHS.applicationHub, '신청 현황 보기');
    case 'VIEW_VISIT_SCHEDULE':
      return application(PATHS.visit, '일정 확인');
    case 'VIEW_INSPECTION_PROGRESS':
      return application(PATHS.inspectionProgress, '진행 현황 보기');
    case 'WAIT_FOR_RESULT':
      return application(PATHS.applicationHub, '점검 현황 보기');
    case 'CHECK_SUPPORT_OPTIONS':
      return application(PATHS.support, '지원사업 알아보기');
    case 'CONTINUE_SUPPORT_FORM':
      return { label: '이어서 작성', to: null };
    case 'UPLOAD_LANDLORD_CONSENT':
      return { label: '동의서 등록', to: null };
    case 'VIEW_SUPPORT_PROGRESS':
      return application(PATHS.supportStatus, '검토 현황 보기', supportId !== null);
    case 'VIEW_REJECTION':
      return application(PATHS.supportStatus, '반려 사유 확인', supportId !== null);
    case 'VIEW_CONSTRUCTION_SCHEDULE':
      return currentStage === 'SUPPORT_APPROVED'
        ? application(PATHS.supportStatus, '시공 일정 확인', supportId !== null)
        : application(PATHS.construction, '일정 확인', constructionId !== null);
    case 'VIEW_PROGRESS':
      return application(PATHS.constructionProgress, '진행 현황 보기', constructionId !== null);
    case 'VIEW_COMPLETION':
      return application(PATHS.constructionComplete, '완료 내용 확인', constructionId !== null);
    default:
      return null;
  }
}
