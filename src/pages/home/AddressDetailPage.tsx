import { MapPin } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getPrimaryAddress } from '@/lib/address';
import { env } from '@/lib/env';
import { useAddressDraft, type ResidenceFloor } from '@/stores/addressDraft';

const floors: { value: ResidenceFloor; label: string }[] = [
  { value: 'BASEMENT', label: '반지하 / 지하' },
  { value: 'FIRST', label: '1층' },
  { value: 'SECOND_OR_ABOVE', label: '2층 이상' },
];

export default function AddressDetailPage() {
  const navigate = useNavigate();
  const { address, coordinates, detail, floor, setDetail, setFloor } = useAddressDraft();
  const mockLevel = useAddressDraft((state) => state.mockLevel);
  const setMockLevel = useAddressDraft((state) => state.setMockLevel);
  if (!address || !coordinates) return <Navigate to={PATHS.addressSearch} replace />;
  const canContinue = detail.trim().length > 0 && floor !== null;
  const returnToSearch = () =>
    navigate(PATHS.addressSearch, {
      state: { restoreAddressSearch: true },
      preventScrollReset: true,
    });

  return (
    <Screen
      header={{
        title: '상세 주소 입력',
        onBack: returnToSearch,
        className: 'px-5 [&_h1]:text-[18px] [&_svg]:size-6',
      }}
      tab="home"
      className="pt-3"
      bottom={
        <Button disabled={!canContinue} onClick={() => navigate(PATHS.riskLoading)}>
          이 주소로 분석하기
        </Button>
      }
    >
      <h1 className="text-ink text-[23px] leading-8 font-bold">
        우리 집의 상세 정보를
        <br />
        입력해 주세요.
      </h1>
      <p className="text-body text-muted mt-1 leading-5">
        정확한 침수 취약도 분석을 위해
        <br />
        상세 주소와 거주 층을 입력해 주세요.
      </p>
      <div className="border-border/60 bg-soft mt-7 flex min-h-18 items-center gap-2 rounded-xl border px-2.5 py-2">
        <span className="bg-primary/10 text-primary grid size-[35px] shrink-0 place-items-center rounded-[10px]">
          <MapPin size={19} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption text-muted">선택한 주소</p>
          <p className="text-ink text-[15px] leading-5 font-bold wrap-break-word">
            {getPrimaryAddress(address)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          fullWidth={false}
          onClick={returnToSearch}
          className="border-primary/20 text-primary h-[34px] min-w-18 shrink-0 rounded-2xl px-2.5 text-[12px] leading-[18px] font-bold"
        >
          주소 변경
        </Button>
      </div>
      <TextField
        label="상세 주소"
        size="md"
        placeholder="예: 101동 302호"
        maxLength={255}
        value={detail}
        onChange={(e) => {
          setDetail(e.target.value);
        }}
        required
        className="text-[15px] leading-5"
        containerClassName="mt-3.5 [&>label]:text-section [&>div]:h-[46px] [&>div]:rounded-[9px] [&>div]:pl-3.5"
      />
      <fieldset className="mt-4">
        <legend className="text-section text-ink mb-2">거주 층</legend>
        <div className="flex flex-col gap-2">
          {floors.map((option) => (
            <label
              key={option.value}
              className={`focus-within:outline-primary flex min-h-[55px] cursor-pointer items-center gap-3.5 rounded-[10px] border px-4 py-2 text-[15px] leading-[22px] focus-within:outline focus-within:outline-2 ${floor === option.value ? 'border-primary bg-soft text-primary font-semibold' : 'border-border bg-surface text-ink'}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="floor"
                value={option.value}
                checked={floor === option.value}
                onChange={() => {
                  setFloor(option.value);
                }}
              />
              <span
                aria-hidden
                className={`grid size-[19px] shrink-0 place-items-center rounded-full border ${floor === option.value ? 'border-primary' : 'border-border'}`}
              >
                {floor === option.value && <span className="bg-primary size-[9px] rounded-full" />}
              </span>
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="sr-only">거주 층을 선택한 뒤 아래 버튼을 눌러 분석해 주세요.</p>
      {env.useMock && floor !== 'SECOND_OR_ABOVE' && (
        <label className="text-caption text-muted mt-4 block">
          개발용 목업 결과 선택
          <select
            className="border-border bg-surface text-ink mt-2 block h-11 w-full rounded-md border px-3"
            value={mockLevel}
            onChange={(e) => setMockLevel(e.target.value as typeof mockLevel)}
          >
            <option value="HIGH">높음</option>
            <option value="CAUTION">주의</option>
            <option value="LOW">낮음</option>
          </select>
        </label>
      )}
    </Screen>
  );
}
