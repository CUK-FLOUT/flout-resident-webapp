import { useState } from 'react';
import { Search } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { getPrimaryAddress } from '@/lib/address';
import { useAddressDraft, type ResidenceFloor } from '@/stores/addressDraft';

const floors: { value: ResidenceFloor; label: string }[] = [
  { value: 'BASEMENT', label: '반지하 / 지하' },
  { value: 'FIRST', label: '1층' },
  { value: 'SECOND_OR_ABOVE', label: '2층 이상' },
];

export default function AddressDetailPage() {
  const navigate = useNavigate();
  const { address, coordinates, detail, floor, setDetail, setFloor } = useAddressDraft();
  const [notice, setNotice] = useState(false);
  if (!address || !coordinates) return <Navigate to={PATHS.addressSearch} replace />;
  const canContinue = detail.trim().length > 0 && floor !== null;
  const returnToSearch = () =>
    navigate(PATHS.addressSearch, { state: { restoreAddressSearch: true }, preventScrollReset: true });

  return (
    <Screen
      header={{ title: '상세 주소 입력', onBack: returnToSearch }}
      tab="home"
      className="pt-4"
      bottom={
        <Button disabled={!canContinue} onClick={() => setNotice(true)}>
          이 주소로 분석하기
        </Button>
      }
    >
      <h1 className="text-title text-ink">우리 집은 몇 층인가요?</h1>
      <p className="text-body text-ink mt-2">
        주소와 거주 층을 함께 확인해
        <br />
        우리 집에 맞는 침수 정보를 안내해요.
      </p>
      <div className="mt-3">
        <p className="text-caption text-ink mb-2">주소 검색</p>
        <button
          type="button"
          onClick={returnToSearch}
          className="border-border bg-surface text-body text-ink flex h-11 w-full items-center gap-2 rounded-md border px-3 text-left"
        >
          <Search size={20} className="text-muted shrink-0" aria-hidden />
          <span className="min-w-0 truncate">{getPrimaryAddress(address)}</span>
        </button>
      </div>
      <TextField
        label="상세 주소"
        size="md"
        placeholder="예: 101동 302호"
        value={detail}
        onChange={(e) => {
          setDetail(e.target.value);
          setNotice(false);
        }}
        required
        containerClassName="mt-3"
      />
      <fieldset className="mt-3">
        <legend className="text-caption text-ink">거주 층을 아래에서 선택해 주세요.</legend>
        <div className="mt-3 flex flex-col gap-3">
          {floors.map((option) => (
            <label
              key={option.value}
              className={`text-button focus-within:outline-primary flex h-13 cursor-pointer items-center justify-center rounded-md border focus-within:outline focus-within:outline-2 ${floor === option.value ? 'border-primary bg-soft text-primary' : 'border-border bg-surface text-ink'}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="floor"
                value={option.value}
                checked={floor === option.value}
                onChange={() => {
                  setFloor(option.value);
                  setNotice(false);
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-caption text-ink mt-3">
        거주 층을 선택한 뒤 아래 버튼을 눌러 분석해 주세요.
      </p>
      {notice && (
        <p role="status" className="text-body text-muted mt-4">
          입력한 주소가 준비됐어요. 침수 취약도 분석 서비스는 준비 중이에요.
        </p>
      )}
    </Screen>
  );
}
