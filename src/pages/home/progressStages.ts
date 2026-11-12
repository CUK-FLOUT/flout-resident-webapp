import analysis from '@/assets/home/progress/analysis.svg';
import analysisFailed from '@/assets/home/progress/analysis-failed.svg';
import analysisComplete from '@/assets/home/progress/analysis-complete.svg';
import guide from '@/assets/home/progress/guide.svg';
import guideProgress from '@/assets/home/progress/guide-progress.svg';
import guideComplete from '@/assets/home/progress/guide-complete.svg';
import inspectionDraft from '@/assets/home/progress/inspection-draft.svg';
import camera from '@/assets/home/progress/camera.svg';
import inspectionReceived from '@/assets/home/progress/inspection-received.svg';
import calendar from '@/assets/home/progress/calendar.svg';
import inspectionProgress from '@/assets/home/progress/inspection-progress.svg';
import clock from '@/assets/home/progress/clock.svg';
import inspectionResult from '@/assets/home/progress/inspection-result.svg';
import supportDraft from '@/assets/home/progress/support-draft.svg';
import upload from '@/assets/home/progress/upload.svg';
import review from '@/assets/home/progress/review.svg';
import approved from '@/assets/home/progress/approved.svg';
import rejected from '@/assets/home/progress/rejected.svg';
import constructionProgress from '@/assets/home/progress/construction-progress.svg';
import constructionComplete from '@/assets/home/progress/construction-complete.svg';

interface ProgressStage {
  icon: string;
  tone: string;
  actionLabel: string;
}

export const progressStages = new Map<string, ProgressStage>([
  [
    'RISK_ASSESSMENT_IN_PROGRESS',
    {
      icon: analysis,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '분석 현황',
    },
  ],
  [
    'RISK_ASSESSMENT_FAILED',
    {
      icon: analysisFailed,
      tone: 'bg-(--home-failed)',
      actionLabel: '결과 확인',
    },
  ],
  [
    'RISK_ASSESSMENT_COMPLETED',
    {
      icon: analysisComplete,
      tone: 'bg-(--home-complete)',
      actionLabel: '결과 확인',
    },
  ],
  [
    'GUIDE_AVAILABLE',
    {
      icon: guide,
      tone: 'bg-(--home-guide)',
      actionLabel: '가이드 보기',
    },
  ],
  [
    'GUIDE_IN_PROGRESS',
    {
      icon: guideProgress,
      tone: 'bg-(--home-guide)',
      actionLabel: '이어서 보기',
    },
  ],
  [
    'GUIDE_COMPLETED',
    {
      icon: guideComplete,
      tone: 'bg-(--home-complete)',
      actionLabel: '점검 안내',
    },
  ],
  [
    'INSPECTION_FORM_EDITING',
    {
      icon: inspectionDraft,
      tone: 'bg-(--home-draft)',
      actionLabel: '이어서 작성',
    },
  ],
  [
    'INSPECTION_DRAFT',
    {
      icon: camera,
      tone: 'bg-(--home-draft)',
      actionLabel: '사진 등록',
    },
  ],
  [
    'INSPECTION_RECEIVED',
    {
      icon: inspectionReceived,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '신청 현황',
    },
  ],
  [
    'VISIT_SCHEDULED',
    {
      icon: calendar,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '일정 확인',
    },
  ],
  [
    'INSPECTION_IN_PROGRESS',
    {
      icon: inspectionProgress,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '진행 현황',
    },
  ],
  [
    'INSPECTION_RESULT_PENDING',
    {
      icon: clock,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '점검 현황',
    },
  ],
  [
    'INSPECTION_RESULT_PUBLISHED',
    {
      icon: inspectionResult,
      tone: 'bg-(--home-complete)',
      actionLabel: '점검 결과 확인',
    },
  ],
  [
    'SUPPORT_FORM_EDITING',
    {
      icon: supportDraft,
      tone: 'bg-(--home-draft)',
      actionLabel: '이어서 작성',
    },
  ],
  [
    'SUPPORT_DRAFT',
    {
      icon: upload,
      tone: 'bg-(--home-draft)',
      actionLabel: '동의서 등록',
    },
  ],
  [
    'SUPPORT_REVIEW',
    {
      icon: review,
      tone: 'bg-(--home-review)',
      actionLabel: '검토 현황',
    },
  ],
  [
    'SUPPORT_APPROVED',
    {
      icon: approved,
      tone: 'bg-(--home-complete)',
      actionLabel: '승인 결과 확인',
    },
  ],
  [
    'SUPPORT_REJECTED',
    {
      icon: rejected,
      tone: 'bg-(--home-failed)',
      actionLabel: '반려 사유 확인',
    },
  ],
  [
    'CONSTRUCTION_SCHEDULED',
    {
      icon: calendar,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '일정 확인',
    },
  ],
  [
    'CONSTRUCTION_IN_PROGRESS',
    {
      icon: constructionProgress,
      tone: 'bg-(--home-scheduled)',
      actionLabel: '진행 현황',
    },
  ],
  [
    'CONSTRUCTION_COMPLETED',
    {
      icon: constructionComplete,
      tone: 'bg-(--home-complete)',
      actionLabel: '완료 내용 확인',
    },
  ],
]);
