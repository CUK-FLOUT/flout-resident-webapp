import { useState } from 'react';
import { Check, MapPin, Search } from 'lucide-react';
import { generatePath, useNavigate } from 'react-router';
import { useAddressSearch, useCreateAssessment } from '@/api/risk';
import { BottomCTA } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { RISK_LEVEL } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { recentAddressStorage } from '@/lib/storage';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import type { AddressCandidate } from '@/types/domain';

/**
 * Figma: 01 홈화면 (1115:2381)
 * 기능명세: RISK-01 주소 검색 → RISK-02~06 분석 → 취약도 결과 이동
 */
export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const debounced = useDebouncedValue(keyword.trim());
  const search = useAddressSearch(debounced);
  const assess = useCreateAssessment();
  const recent = recentAddressStorage.list();

  const goResult = (assessmentId: string) =>
    navigate(generatePath(PATHS.riskResult, { assessmentId }));

  const handleSelect = (address: AddressCandidate) => {
    assess.mutate(address, {
      onSuccess: (result) => {
        recentAddressStorage.push({
          address: result.house.address,
          riskLabel: RISK_LEVEL[result.riskLevel].label,
          assessmentId: result.id,
        });
        goResult(result.id);
      },
    });
  };

  const showCandidates = debounced.length >= 2 && !assess.isPending;

  return (
    <>
      <main className="flex flex-1 flex-col px-gutter pt-20 pb-6">
        <p className="text-caption text-body-text">반지하 침수 예방 서비스</p>
        <h1 className="mt-3 text-title text-ink">
          우리 집,
          <br />비 오기 전에 확인해요.
        </h1>

        <div className="relative mt-6">
          <TextField
            label="주소 검색"
            placeholder="주소를 입력해주세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
            rightSlot={<Search size={20} className="mr-3 text-muted" aria-hidden />}
            helperText={
              assess.isPending ? '공공데이터로 침수 취약도를 분석하고 있어요…' : undefined
            }
            errorText={assess.isError ? '분석에 실패했어요. 다시 선택해 주세요.' : undefined}
          />

          {showCandidates && (
            <ul
              role="listbox"
              aria-label="주소 검색 결과"
              className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-surface"
            >
              {search.isLoading && <li className="p-4 text-caption text-muted">검색 중…</li>}
              {search.data?.length === 0 && (
                <li className="p-4 text-caption text-muted">
                  검색 결과가 없어요. 도로명과 건물번호로 검색해 보세요.
                </li>
              )}
              {search.data?.map((a) => (
                <li key={a.buildingManagementNo} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(a)}
                    className="flex w-full items-start gap-2 px-4 py-3 text-left active:bg-soft"
                  >
                    <MapPin size={16} className="mt-1 shrink-0 text-primary" aria-hidden />
                    <span className="flex flex-col">
                      <span className="text-label text-ink">{a.roadAddress}</span>
                      <span className="text-caption text-muted">{a.jibunAddress}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {recent.length > 0 && (
          <section className="mt-10">
            <h2 className="text-label text-ink">최근 확인한 주소</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {recent.map((r) => (
                <li key={r.assessmentId}>
                  <button
                    type="button"
                    onClick={() => goResult(r.assessmentId)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="truncate text-label text-ink">{r.address}</span>
                    <span className="shrink-0 text-body text-body-text">
                      침수 취약도 {r.riskLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-section text-ink">주소를 확인한 다음에는</h2>
          <ol className="mt-6 flex flex-col gap-8">
            <Step
              n={1}
              title="침수 취약도 확인"
              desc="공공 데이터를 기반으로 위험 요인과 점검 필요도를 확인해요."
            />
            <Step
              n={2}
              title="필요하면 현장점검 신청"
              desc="전문가가 직접 주택을 확인하고 예방조치를 안내해요."
            />
          </ol>
        </section>
      </main>

      {/* Figma 12 · Navigation › 홈 하단 행동 · 두 버튼 */}
      <BottomCTA className="flex-row">
        <Button
          variant="soft"
          leftIcon={<Check size={16} />}
          onClick={() => navigate(PATHS.applications)}
        >
          내 신청
        </Button>
        <Button
          variant="soft"
          leftIcon={<Check size={16} />}
          onClick={() => navigate(PATHS.notifications)}
        >
          알림
        </Button>
      </BottomCTA>
    </>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex items-center gap-4">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-section text-on-primary"
      >
        {n}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-label text-ink">{title}</span>
        <span className="text-body text-body-text">{desc}</span>
      </span>
    </li>
  );
}
