import { useQuery } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { getInspectionReceipt } from '@/api/applications';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { env } from '@/lib/env';

export default function InspectionCompletePage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const valid = Boolean(
    applicationId &&
    /^\d+$/.test(applicationId) &&
    Number(applicationId) > 0 &&
    Number.isSafeInteger(Number(applicationId)),
  );
  const query = useQuery({
    queryKey: ['inspection-receipt', applicationId, env.useMock],
    queryFn: () => getInspectionReceipt(Number(applicationId)),
    enabled: valid,
    retry: false,
  });
  if (!valid)
    return (
      <Screen
        header={{ title: '현장점검 신청' }}
        tab="home"
        bottom={<Button onClick={() => navigate(PATHS.home)}>홈으로 가기</Button>}
      >
        <p role="alert" className="text-body text-muted pt-10 text-center">
          신청 정보를 확인할 수 없어요.
        </p>
      </Screen>
    );
  if (query.isLoading)
    return (
      <Screen header={{ title: '현장점검 신청' }} tab="home">
        <p role="status" className="text-body text-muted pt-10 text-center">
          신청 상태를 확인하고 있어요.
        </p>
      </Screen>
    );
  if (!query.data)
    return (
      <Screen
        header={{ title: '현장점검 신청' }}
        tab="home"
        bottom={<Button onClick={() => void query.refetch()}>다시 시도</Button>}
      >
        <p role="alert" className="text-body text-muted pt-10 text-center">
          신청 상태를 불러오지 못했어요.
        </p>
      </Screen>
    );
  const receipt = query.data;
  if (receipt.applicationStatus === 'DRAFT')
    return (
      <Screen
        header={{ title: '현장점검 신청' }}
        tab="home"
        bottom={
          <Button onClick={() => navigate(PATHS.inspectionSchedule)}>사진 등록 확인하기</Button>
        }
      >
        <p role="status" className="text-body text-muted pt-10 text-center">
          임시 저장된 신청이에요. 사진 등록이 완료되어야 접수됩니다.
        </p>
      </Screen>
    );
  if (!['RECEIVED', 'INSPECTION_COMPLETED'].includes(receipt.applicationStatus))
    return (
      <Screen header={{ title: '현장점검 신청' }}>
        <p role="alert" className="text-body text-muted pt-10 text-center">
          접수 상태를 확인할 수 없어요.
        </p>
      </Screen>
    );
  const rows = [
    ['신청 번호', receipt.receiptNumber],
    ['신청 일자', receipt.submittedAt ? receipt.submittedAt.slice(0, 10) : '확인할 수 없음'],
    ['현재 상태', receipt.applicationStatus === 'INSPECTION_COMPLETED' ? '점검 완료' : '접수'],
    [
      '신청자',
      <>
        <span className="block">{receipt.applicant.name}</span>
        <span className="mt-1 block">{receipt.applicant.phone}</span>
      </>,
    ],
    [
      '신청 주소',
      <>
        <span className="block">{receipt.address}</span>
        {receipt.detailAddress?.trim() && (
          <span className="mt-1 block">{receipt.detailAddress}</span>
        )}
      </>,
    ],
  ] as const;
  return (
    <Screen
      tab="home"
      bottom={
        <>
          <Button variant="secondary" onClick={() => navigate(PATHS.home)}>
            홈으로 가기
          </Button>
          <Button
            onClick={() =>
              navigate(
                generatePath(PATHS.inspectionNextSteps, {
                  applicationId: String(receipt.applicationId),
                }),
              )
            }
          >
            이후 진행 절차 보기
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center pt-12 text-center">
        <CheckCircle size={32} className="text-primary" aria-hidden />
        <h1 className="text-title mt-4">현장점검 신청이 접수됐어요</h1>
        <p className="text-body mt-3">
          담당자가 신청 내용을 확인한 뒤<br />
          방문 가능한 일정을 조율해 안내할 예정이에요.
        </p>
      </div>
      <section className="mt-10">
        <h2 className="text-heading">신청 정보</h2>
        <dl className="mt-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="border-border text-body flex justify-between gap-4 border-b py-3"
            >
              <dt className="shrink-0">{label}</dt>
              <dd className="min-w-0 text-right break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Screen>
  );
}
