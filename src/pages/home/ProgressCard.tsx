import { Link } from 'react-router';
import type { ResidentProgressItem } from '@/api/residentProgress';
import calendar from '@/assets/home/calendar.svg';
import pencil from '@/assets/home/pencil.svg';
import homePin from '@/assets/home/pin.svg';
import listPin from '@/assets/home/progress/pin.svg';
import review from '@/assets/home/review.svg';
import stepInspection from '@/assets/home/step-inspection.svg';
import { cn } from '@/lib/cn';
import { getProgressDestination } from './progressDestination';
import { progressStages } from './progressStages';

const progressTypeByStage = new Map([
  ['RISK_ASSESSMENT_COMPLETED', '침수 취약도 분석'],
  ['GUIDE_AVAILABLE', '침수 예방 가이드'],
  ['GUIDE_COMPLETED', '침수 예방 가이드'],
  ['INSPECTION_FORM_EDITING', '현장점검 신청'],
  ['SUPPORT_FORM_EDITING', '지원 신청'],
]);

const progressTypeByApplication = {
  RISK_ASSESSMENT: '침수 취약도 분석',
  INSPECTION: '현장점검 신청',
  SUPPORT: '지원 신청',
} satisfies Record<ResidentProgressItem['applicationType'], string>;

export function ProgressCard({
  item,
  list = false,
  stage,
}: {
  item: ResidentProgressItem;
  list?: boolean;
  stage?: { icon: string; tone: string; actionLabel: string };
}) {
  const action = getProgressDestination(item);
  const caption = item.receiptNumber
    ? `신청번호 ${item.receiptNumber}`
    : ((list && item.currentStage === 'GUIDE_IN_PROGRESS' ? '침수 예방 가이드' : undefined) ??
      progressTypeByStage.get(item.currentStage) ??
      progressTypeByApplication[item.applicationType]);
  const appearance =
    stage ??
    progressStages.get(item.currentStage) ??
    (action?.label === '이어서 작성'
      ? { icon: pencil, tone: 'bg-(--home-draft)' }
      : item.currentStage === 'VISIT_SCHEDULED'
        ? { icon: calendar, tone: 'bg-(--home-scheduled)' }
        : item.applicationType === 'SUPPORT'
          ? { icon: review, tone: 'bg-(--home-review)' }
          : { icon: stepInspection, tone: 'bg-soft' });

  return (
    <ProgressCardView
      {...appearance}
      caption={caption}
      title={item.title}
      address={item.address}
      actionLabel={action?.label ?? stage?.actionLabel ?? '이동할 수 없음'}
      to={action?.to}
      list={list}
    />
  );
}

function ProgressCardView({
  caption,
  title,
  address,
  icon,
  tone,
  actionLabel,
  to,
  list = false,
}: {
  caption: string;
  title: string;
  address: string;
  icon: string;
  tone: string;
  actionLabel: string;
  to?: string | null;
  list?: boolean;
}) {
  const actionStyle = cn(
    'min-h-[26px] min-w-[66px] px-2 text-center text-[10px] leading-4 min-[360px]:min-w-[88px]',
    list ? 'rounded-lg' : 'rounded-full',
  );

  return (
    <li
      className={cn(
        'bg-surface grid min-h-[76px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[10px] border border-(--home-border) px-[11px] py-2 min-[360px]:gap-3',
        list && 'min-[360px]:pr-[19px]',
      )}
    >
      <span
        className={cn(tone, 'grid size-9 place-items-center rounded-[9px] min-[360px]:size-11')}
      >
        {list ? <img src={icon} alt="" /> : <img src={icon} width={24} height={24} alt="" />}
      </span>
      <div className="min-w-0">
        <p className="text-body-text text-[10px] leading-4">{caption}</p>
        <h3
          className={cn(
            'text-ink font-bold',
            list ? 'text-[11px] leading-[19px]' : 'text-[13px] leading-[18px] tracking-[-0.035em]',
          )}
        >
          {title}
        </h3>
        {address && (
          <p className="text-body-text mt-1 flex min-w-0 items-center gap-1 text-[10px] leading-4">
            <img
              src={list ? listPin : homePin}
              width={14}
              height={14}
              className="shrink-0"
              alt=""
            />
            <span className="truncate">{address}</span>
          </p>
        )}
      </div>
      {to ? (
        <Link
          to={to}
          aria-label={title + ' · ' + actionLabel}
          className={cn('flex min-h-11 items-center', !list && 'rounded-full')}
        >
          <span
            className={cn(
              actionStyle,
              'grid place-items-center bg-(--home-tint) font-bold text-(--home-action)',
            )}
          >
            {actionLabel}
          </span>
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className={cn(
            actionStyle,
            list ? 'bg-(--home-tint) font-bold text-(--home-action)' : 'text-muted bg-soft',
          )}
        >
          {actionLabel}
        </button>
      )}
    </li>
  );
}
