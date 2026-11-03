import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button, ChoiceGroup, ProgressBar, TextField } from '@/components/ui';
import { VISIT_TIME_OPTIONS } from '@/constants/labels';
import { PATHS } from '@/constants/paths';
import { photoError, step1Error, step2Error } from '@/lib/inspection';
import { useAddressDraft } from '@/stores/addressDraft';
import { useInspectionDraft } from '@/stores/inspectionDraft';

function PhotoPreview({
  file,
  index,
  replace,
  remove,
}: {
  file: File;
  index: number;
  replace: (file: File) => void;
  remove: () => void;
}) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <li className="relative">
      <label className="bg-page focus-within:outline-primary relative flex size-24 cursor-pointer overflow-hidden rounded-md focus-within:outline focus-within:outline-2">
        {url && <img src={url} alt="" className="size-full object-cover" />}
        <span className="bg-ink/70 text-on-primary text-caption absolute inset-x-0 bottom-0 text-center">
          사진 교체
        </span>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="sr-only"
          aria-label={`${index + 1}번째 사진 교체`}
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) replace(selected);
            e.target.value = '';
          }}
        />
      </label>
      <button
        type="button"
        aria-label={`${index + 1}번째 사진 삭제`}
        onClick={remove}
        className="bg-ink/70 text-on-primary focus-visible:outline-primary absolute top-1 right-1 flex size-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

export default function InspectionSchedulePage() {
  const navigate = useNavigate();
  const draft = useInspectionDraft();
  const result = useAddressDraft((s) => s.result);
  const [error, setError] = useState('');
  const [showPhotoAlert, setShowPhotoAlert] = useState(false);
  useEffect(() => {
    if (!showPhotoAlert) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPhotoAlert(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [showPhotoAlert]);
  if (!result) return <Navigate to={PATHS.addressSearch} replace />;
  if (draft.assessmentId !== result.id) return <Navigate to={PATHS.inspectionApply} replace />;
  if (step1Error(draft)) return <Navigate to={PATHS.inspectionApply} replace />;
  const setPhotos = (photos: File[]) => {
    draft.update({ photos });
    setError('');
  };
  return (
    <>
      <Screen
        header={{ title: '현장점검하기', onBack: () => navigate(PATHS.inspectionApply) }}
        tab="home"
        bottom={
          <Button
            variant={step2Error(draft) ? 'muted' : 'primary'}
            onClick={() => {
              if (!draft.photos.length) {
                setShowPhotoAlert(true);
                return;
              }
              const message = step2Error(draft);
              setError(message ?? '');
              if (!message) navigate(PATHS.inspectionConfirm);
            }}
          >
            신청 정보 확인
          </Button>
        }
      >
        <div className="flex flex-col gap-6 pt-4">
          <div>
            <p className="text-caption">사진과 일정</p>
            <h1 className="text-title mt-2">
              전문가가 방문 전<br />
              상황을 미리 볼 수 있어요.
            </h1>
            <p className="text-body mt-2">
              희망 날짜와 시간대는 실제 방문 일정 조율을 위한 참고정보예요.
            </p>
            <ProgressBar className="mt-3" value={2} max={3} label="신청 2 / 3" />
          </div>
          <section>
            <div className="flex justify-between gap-2">
              <h2 className="text-label">주택 상태 사진</h2>
              <span className="text-caption text-primary">필수 · 최소 1장</span>
            </div>
            {draft.photos.length === 0 && (
              <label className="bg-border/50 text-label focus-within:outline-primary mt-2 flex min-h-24 cursor-pointer items-center justify-center rounded-md focus-within:outline focus-within:outline-2">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const files = [...draft.photos, ...Array.from(e.target.files ?? [])];
                    const message = photoError(files);
                    if (message) setError(message);
                    else setPhotos(files);
                    e.target.value = '';
                  }}
                />
                사진을 선택해 주세요
              </label>
            )}
            {draft.photos.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {draft.photos.map((file, index) => (
                  <PhotoPreview
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    file={file}
                    index={index}
                    remove={() => setPhotos(draft.photos.filter((_, i) => i !== index))}
                    replace={(replacement) => {
                      const files = draft.photos.map((photo, i) =>
                        i === index ? replacement : photo,
                      );
                      const message = photoError(files);
                      if (message) setError(message);
                      else setPhotos(files);
                    }}
                  />
                ))}
                {draft.photos.length < 5 && (
                  <li>
                    <label className="border-border bg-surface text-label text-primary focus-within:outline-primary flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed focus-within:outline focus-within:outline-2">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          const files = [...draft.photos, ...Array.from(e.target.files ?? [])];
                          const message = photoError(files);
                          if (message) setError(message);
                          else setPhotos(files);
                          e.target.value = '';
                        }}
                      />
                      <Plus size={20} aria-hidden="true" />
                      사진 추가
                    </label>
                  </li>
                )}
              </ul>
            )}
          </section>
          <TextField
            type="date"
            size="md"
            label="희망 방문일 · 필수"
            containerClassName="[&>div]:px-0"
            className="cursor-pointer px-4"
            inputMode="none"
            min={new Date().toLocaleDateString('sv-SE')}
            value={draft.preferredDate}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.();
              } catch {
                // 기본 날짜 입력 동작을 지원하는 브라우저에서는 그대로 사용합니다.
              }
            }}
            onChange={(e) => draft.update({ preferredDate: e.target.value })}
            helperText="실제 방문일은 배정 후 확정돼요."
          />
          <ChoiceGroup
            className="[&>p]:text-label"
            label="방문 가능 시간 · 필수"
            options={VISIT_TIME_OPTIONS}
            value={draft.preferredTimeSlot}
            onChange={(preferredTimeSlot) => draft.update({ preferredTimeSlot })}
          />
          {error && (
            <p role="alert" className="text-body text-danger">
              {error}
            </p>
          )}
        </div>
      </Screen>
      {showPhotoAlert && (
        <div className="px-gutter fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-ink/30 absolute inset-0" aria-hidden />
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="photo-alert-title"
            aria-describedby="photo-alert-description"
            className="bg-surface relative w-full max-w-sm rounded-xl p-5 shadow-lg"
          >
            <h2 id="photo-alert-title" className="text-heading">
              사진을 등록해 주세요.
            </h2>
            <p id="photo-alert-description" className="text-body text-body-text mt-3">
              현장점검 신청을 위해 사진을 최소 1장 이상 첨부해야 합니다.
            </p>
            <Button className="mt-6" onClick={() => setShowPhotoAlert(false)} autoFocus>
              확인
            </Button>
          </section>
        </div>
      )}
    </>
  );
}
