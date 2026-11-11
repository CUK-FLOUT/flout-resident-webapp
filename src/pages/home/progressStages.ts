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
  caption: string;
  title: string;
  actionLabel: string;
}

export const progressStages = new Map<string, ProgressStage>([
  [
    'RISK_ASSESSMENT_IN_PROGRESS',
    {
      icon: analysis,
      tone: 'bg-(--home-scheduled)',
      caption: '침수 취약도 분석',
      title: '침수 취약도 분석 중이에요',
      actionLabel: '분석 현황',
    },
  ],
  [
    'RISK_ASSESSMENT_FAILED',
    {
      icon: analysisFailed,
      tone: 'bg-(--home-failed)',
      caption: '침수 취약도 분석',
      title: '침수 취약도 분석에 실패했어요',
      actionLabel: '결과 확인',
    },
  ],
  [
    'RISK_ASSESSMENT_COMPLETED',
    {
      icon: analysisComplete,
      tone: 'bg-(--home-complete)',
      caption: '침수 취약도 분석',
      title: '침수 취약도 분석이 완료됐어요',
      actionLabel: '결과 확인',
    },
  ],
  [
    'GUIDE_AVAILABLE',
    {
      icon: guide,
      tone: 'bg-(--home-guide)',
      caption: '침수 예방 가이드',
      title: '침수 예방 가이드가 준비됐어요',
      actionLabel: '가이드 보기',
    },
  ],
  [
    'GUIDE_IN_PROGRESS',
    {
      icon: guideProgress,
      tone: 'bg-(--home-guide)',
      caption: '침수 예방 가이드',
      title: '침수 예방 가이드 확인 중이에요',
      actionLabel: '이어서 보기',
    },
  ],
  [
    'GUIDE_COMPLETED',
    {
      icon: guideComplete,
      tone: 'bg-(--home-complete)',
      caption: '침수 예방 가이드',
      title: '침수 예방 가이드를 확인했어요',
      actionLabel: '점검 안내',
    },
  ],
  [
    'INSPECTION_FORM_EDITING',
    {
      icon: inspectionDraft,
      tone: 'bg-(--home-draft)',
      caption: '현장점검 신청',
      title: '현장점검 신청서 작성 중이에요',
      actionLabel: '이어서 작성',
    },
  ],
  [
    'INSPECTION_DRAFT',
    {
      icon: camera,
      tone: 'bg-(--home-draft)',
      caption: '신청번호 000008',
      title: '현장점검 사진 등록이 필요해요',
      actionLabel: '사진 등록',
    },
  ],
  [
    'INSPECTION_RECEIVED',
    {
      icon: inspectionReceived,
      tone: 'bg-(--home-scheduled)',
      caption: '신청번호 000009',
      title: '현장점검 신청이 접수됐어요',
      actionLabel: '신청 현황',
    },
  ],
  [
    'VISIT_SCHEDULED',
    {
      icon: calendar,
      tone: 'bg-(--home-scheduled)',
      caption: '신청번호 000010',
      title: '현장점검 일정이 확정됐어요',
      actionLabel: '일정 확인',
    },
  ],
  [
    'INSPECTION_IN_PROGRESS',
    {
      icon: inspectionProgress,
      tone: 'bg-(--home-scheduled)',
      caption: '신청번호 000011',
      title: '현장점검이 진행 중이에요',
      actionLabel: '진행 현황',
    },
  ],
  [
    'INSPECTION_RESULT_PENDING',
    {
      icon: clock,
      tone: 'bg-(--home-scheduled)',
      caption: '신청번호 000012',
      title: '현장점검 결과를 준비 중이에요',
      actionLabel: '점검 현황',
    },
  ],
  [
    'INSPECTION_RESULT_PUBLISHED',
    {
      icon: inspectionResult,
      tone: 'bg-(--home-complete)',
      caption: '신청번호 000013',
      title: '현장점검 결과가 공개됐어요',
      actionLabel: '지원사업 보기',
    },
  ],
  [
    'SUPPORT_FORM_EDITING',
    {
      icon: supportDraft,
      tone: 'bg-(--home-draft)',
      caption: '신청번호 000014',
      title: '지원 신청서 작성 중이에요',
      actionLabel: '이어서 작성',
    },
  ],
  [
    'SUPPORT_DRAFT',
    {
      icon: upload,
      tone: 'bg-(--home-draft)',
      caption: '신청번호 000015',
      title: '임대인 동의서 등록이 필요해요',
      actionLabel: '동의서 등록',
    },
  ],
  [
    'SUPPORT_REVIEW',
    {
      icon: review,
      tone: 'bg-(--home-review)',
      caption: '신청번호 000016',
      title: '지원 신청을 검토 중이에요',
      actionLabel: '검토 현황',
    },
  ],
  [
    'SUPPORT_APPROVED',
    {
      icon: approved,
      tone: 'bg-(--home-complete)',
      caption: '신청번호 000017',
      title: '지원 신청이 승인됐어요',
      actionLabel: '시공 일정 확인',
    },
  ],
  [
    'SUPPORT_REJECTED',
    {
      icon: rejected,
      tone: 'bg-(--home-failed)',
      caption: '신청번호 000018',
      title: '지원 신청이 반려됐어요',
      actionLabel: '반려 사유 확인',
    },
  ],
  [
    'CONSTRUCTION_SCHEDULED',
    {
      icon: calendar,
      tone: 'bg-(--home-scheduled)',
      caption: '신청번호 000019',
      title: '시공 일정이 확정됐어요',
      actionLabel: '일정 확인',
    },
  ],
  [
    'CONSTRUCTION_IN_PROGRESS',
    {
      icon: constructionProgress,
      tone: 'bg-(--home-scheduled)',
      caption: '신청번호 000020',
      title: '시공이 진행 중이에요',
      actionLabel: '진행 현황',
    },
  ],
  [
    'CONSTRUCTION_COMPLETED',
    {
      icon: constructionComplete,
      tone: 'bg-(--home-complete)',
      caption: '신청번호 000021',
      title: '시공이 완료됐어요',
      actionLabel: '완료 내용 확인',
    },
  ],
]);
