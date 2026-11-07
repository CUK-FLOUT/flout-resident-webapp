import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPinOff, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAddressCoordinates, useAddressSearch, type AddressSearchItem } from '@/api/risk';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { ApiError, RefreshError } from '@/lib/http';
import { getPrimaryAddress } from '@/lib/address';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useAddressDraft } from '@/stores/addressDraft';

function isBucheon(address: AddressSearchItem) {
  const values = [address.roadAddress, address.jibunAddress].filter((value) => value?.trim());
  return (
    values.length > 0 &&
    values.every((value) => /^(?:(?:경기도|경기)\s+)?부천시(?:\s|$)/.test(value.trim()))
  );
}

function explicitlyOutsideBucheon(keyword: string) {
  const text = keyword.trim();
  if (/(?:^|\s)부천시(?:\s|$)/.test(text)) return false;
  return (
    /^(?:서울(?:시|특별시)?|인천(?:시|광역시)?|부산(?:시|광역시)?|대구(?:시|광역시)?|광주(?:시|광역시)?|대전(?:시|광역시)?|울산(?:시|광역시)?|세종(?:시|특별자치시)?|제주(?:도|특별자치도)?)(?:\s|$)/.test(
      text,
    ) || /^(?:(?:경기도|경기)\s+)?(?!부천시\b)[가-힣]+시(?:\s|$)/.test(text)
  );
}

function addressErrorMessage(error: unknown, operation: 'search' | 'coordinates', next = false) {
  const coordinates = operation === 'coordinates';
  const service = coordinates ? '주소 좌표 조회' : '주소 검색';
  const fallback = coordinates
    ? '주소 좌표를 불러오지 못했어요. 다시 시도해 주세요.'
    : next
      ? '다음 검색 결과를 불러오지 못했어요.'
      : '주소 검색에 실패했어요. 다시 시도해 주세요.';
  if (!(error instanceof ApiError)) return fallback;
  if (error instanceof RefreshError) return error.message;
  if (error.status === 401) return '로그인이 필요해요. 다시 로그인해 주세요.';
  if (error.status === 400)
    return coordinates
      ? '부천시 내의 구체적인 주소를 다시 선택해 주세요.'
      : '검색어를 확인해 주세요.';
  if (coordinates && error.status === 404)
    return '선택한 주소의 위치를 찾지 못했어요. 다른 주소를 선택해 주세요.';
  if (error.status === 502) return `${service} 서비스에 문제가 생겼어요. 다시 시도해 주세요.`;
  if (error.status === 503 || error.code === 'TIMEOUT')
    return `${service} 응답이 늦어지고 있어요. 다시 시도해 주세요.`;
  if (error.code === 'NETWORK') return error.message;
  return fallback;
}

export default function AddressSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectAddress = useAddressDraft((state) => state.selectAddress);
  const keyword = useAddressDraft((state) => state.searchKeyword);
  const revision = useAddressDraft((state) => state.searchRevision);
  const setKeyword = useAddressDraft((state) => state.setSearchKeyword);
  const setSearchScrollY = useAddressDraft((state) => state.setSearchScrollY);
  const [coordinateError, setCoordinateError] = useState<{
    address: AddressSearchItem;
    message: string;
  } | null>(null);
  const sequence = useRef(0);
  const selecting = useRef(false);
  const loadingNext = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const restoredLocation = useRef<string | null>(null);
  const coordinates = useAddressCoordinates();
  const debounced = useDebouncedValue(keyword.trim());
  const current = keyword.trim() === debounced && debounced.length > 0;
  const search = useAddressSearch(debounced, revision, current);
  const { hasNextPage, isFetching, fetchNextPage } = search;
  const pages = current ? (search.data?.pages ?? []) : [];
  const unique = new Map<string, AddressSearchItem>();
  for (const address of pages.flatMap((page) => page.addresses)) {
    const key = JSON.stringify([address.roadAddress, address.jibunAddress, address.zipCode]);
    if (!unique.has(key)) unique.set(key, address);
  }
  const addresses = [...unique.values()];
  const outside =
    current &&
    !search.isFetching &&
    !search.isError &&
    !search.hasNextPage &&
    ((addresses.length === 0 && explicitlyOutsideBucheon(debounced)) ||
      (addresses.length > 0 && addresses.every((address) => !isBucheon(address))));
  const empty =
    current &&
    !outside &&
    pages.length > 0 &&
    addresses.length === 0 &&
    !search.hasNextPage &&
    !search.isFetching &&
    !search.isError;
  const emptyStateClass =
    'flex flex-col items-center gap-3 pt-[clamp(56px,13dvh,110px)] pb-10 text-center';

  useEffect(() => {
    if (
      !location.state?.restoreAddressSearch ||
      restoredLocation.current === location.key ||
      !current ||
      pages.length === 0
    )
      return;
    const scrollY = useAddressDraft.getState().searchScrollY;
    const frame = requestAnimationFrame(() => {
      restoredLocation.current = location.key;
      window.scrollTo(0, scrollY);
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.state, current, pages.length]);

  const loadMore = useCallback(() => {
    if (!current || !hasNextPage || isFetching || loadingNext.current) return;
    loadingNext.current = true;
    void fetchNextPage({ cancelRefetch: false }).finally(() => {
      loadingNext.current = false;
    });
  }, [current, hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    const element = sentinel.current;
    if (
      !element ||
      !current ||
      outside ||
      !search.hasNextPage ||
      search.isFetching ||
      search.isFetchNextPageError ||
      typeof IntersectionObserver === 'undefined'
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [
    current,
    outside,
    search.hasNextPage,
    search.isFetching,
    search.isFetchNextPageError,
    pages.length,
    loadMore,
  ]);

  useEffect(
    () => () => {
      sequence.current += 1;
    },
    [],
  );

  const choose = async (address: AddressSearchItem) => {
    if (!current || !isBucheon(address) || selecting.current) return;
    const requestSequence = sequence.current;
    selecting.current = true;
    setCoordinateError(null);
    try {
      const result = await coordinates.mutateAsync(getPrimaryAddress(address));
      if (requestSequence !== sequence.current) return;
      setSearchScrollY(window.scrollY);
      selectAddress(address, result);
      navigate(PATHS.addressDetail);
    } catch (error) {
      if (requestSequence !== sequence.current) return;
      setCoordinateError({ address, message: addressErrorMessage(error, 'coordinates') });
    } finally {
      selecting.current = false;
    }
  };

  return (
    <Screen
      header={{
        title: '주소 검색',
        onBack: () => navigate(PATHS.home),
        className: outside ? 'px-5 [&_h1]:text-[18px] [&_svg]:size-6' : undefined,
      }}
      tab="home"
      className={outside ? 'pt-[26px]' : 'pt-4'}
    >
      <p className="text-body text-muted">도로명, 건물명 또는 지번으로 검색해 주세요.</p>
      <div className="relative mt-4">
        <Search
          size={20}
          className="text-muted pointer-events-none absolute top-3 left-3 z-10"
          aria-hidden
        />
        <TextField
          aria-label="주소 검색어"
          containerClassName={outside ? '[&>div]:border-primary' : undefined}
          size="md"
          placeholder="도로명, 건물명 또는 지번"
          value={keyword}
          maxLength={100}
          onChange={(e) => {
            sequence.current += 1;
            restoredLocation.current = location.key;
            setCoordinateError(null);
            setKeyword(e.target.value);
          }}
          autoComplete="off"
          enterKeyHint="search"
          className="pl-7"
        />
      </div>
      {current && search.isFetching && !search.isFetchingNextPage && (
        <p role="status" className="text-caption text-muted mt-4">
          검색 중…
        </p>
      )}
      {current && search.isError && !search.isFetchNextPageError && (
        <div role="alert" className="text-body text-danger mt-4">
          <p>{addressErrorMessage(search.error, 'search')}</p>
          <Button variant="text" size="md" fullWidth={false} onClick={() => void search.refetch()}>
            다시 시도
          </Button>
        </div>
      )}
      {outside && (
        <div
          role="status"
          className="flex flex-col items-center gap-3 pt-[clamp(80px,23dvh,184px)] pb-10 text-center"
        >
          <MapPinOff size={24} className="text-muted" aria-hidden />
          <p className="text-ink text-[20px] leading-[22px] font-bold">
            현재 부천시 주소만 지원합니다.
          </p>
          <p className="text-muted text-[15px] leading-[22px]">
            부천시 내 도로명 또는 지번주소를 검색해 주세요.
          </p>
        </div>
      )}
      {empty && (
        <div role="status" className={emptyStateClass}>
          <p className="text-body text-muted">
            검색 결과가 없어요. 도로명이나 지번을 다시 확인해 주세요.
          </p>
        </div>
      )}
      {coordinates.isPending && (
        <p role="status" className="text-caption text-muted mt-4">
          선택한 주소의 위치를 확인하고 있어요…
        </p>
      )}
      {coordinateError && (
        <div role="alert" className="text-body text-danger mt-4">
          <p>{coordinateError.message}</p>
          <Button
            variant="text"
            size="md"
            fullWidth={false}
            onClick={() => void choose(coordinateError.address)}
          >
            다시 시도
          </Button>
        </div>
      )}
      {current && !outside && !empty && pages.length > 0 && (
        <section className="mt-4" aria-label="검색 결과">
          <h2 className="text-caption text-muted">검색 결과</h2>
          <ul className="mt-4">
            {addresses.map((address) => {
              const allowed = isBucheon(address);
              return (
                <li
                  key={JSON.stringify([address.roadAddress, address.jibunAddress, address.zipCode])}
                  className="border-border border-b"
                >
                  <button
                    type="button"
                    onClick={() => void choose(address)}
                    disabled={!allowed || coordinates.isPending}
                    className="flex w-full flex-col gap-1 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="text-label text-ink font-bold">
                      {getPrimaryAddress(address)}
                    </span>
                    {address.roadAddress?.trim() && address.jibunAddress?.trim() && (
                      <span className="text-caption text-muted">지번 · {address.jibunAddress}</span>
                    )}
                    {address.buildingName?.trim() && (
                      <span className="text-caption text-muted">
                        건물명 · {address.buildingName}
                      </span>
                    )}
                    {!allowed && (
                      <span className="text-caption text-muted">
                        부천시 주소만 선택할 수 있어요.
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {search.isFetchNextPageError && (
            <p role="alert" className="text-caption text-danger mt-3">
              {addressErrorMessage(search.error, 'search', true)}
            </p>
          )}
          {search.hasNextPage && (
            <div ref={sentinel}>
              <Button
                variant="secondary"
                size="md"
                className="mt-4"
                loading={search.isFetchingNextPage}
                loadingText="불러오는 중…"
                onClick={loadMore}
              >
                {search.isFetchNextPageError ? '다시 시도' : '검색 결과 더 보기'}
              </Button>
            </div>
          )}
        </section>
      )}
    </Screen>
  );
}
