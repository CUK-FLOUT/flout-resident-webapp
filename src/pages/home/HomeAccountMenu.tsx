import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogout } from '@/api/auth';
import logoutIcon from '@/assets/home/menu-logout.svg';
import moreIcon from '@/assets/home/menu-more.svg';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';

export function HomeAccountMenu() {
  const menuId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    if (!menuOpen || confirmOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target))
        setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen, confirmOpen]);

  useEffect(() => {
    if (!confirmOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [confirmOpen]);

  const closeDialog = () => dialog.current?.close();
  const confirmLogout = () =>
    logout.mutate(undefined, {
      onSettled: () => navigate(PATHS.login, { replace: true }),
    });

  return (
    <div className="relative" ref={container}>
      <button
        ref={trigger}
        type="button"
        aria-label="더보기"
        aria-controls={menuId}
        aria-expanded={menuOpen}
        className="grid size-11 place-items-center rounded-md"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <img src={moreIcon} alt="" />
      </button>
      {menuOpen && (
        <div
          id={menuId}
          className="bg-surface absolute top-[41px] right-2.5 w-[132px] rounded-[10px] shadow-[0_3px_12px_rgb(0_0_0/0.12)]"
        >
          <button
            type="button"
            className="text-ink flex h-11 w-full items-center gap-2.5 rounded-[10px] px-3.5 text-left text-[14px] font-medium"
            onClick={() => {
              dialog.current?.showModal();
              setConfirmOpen(true);
            }}
          >
            <img src={logoutIcon} alt="" />
            로그아웃
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="home-logout-dialog m-auto w-[min(306px,calc(100%-32px))] max-w-none overflow-visible bg-transparent p-0"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        onClose={() => {
          setConfirmOpen(false);
          setMenuOpen(false);
          trigger.current?.focus();
        }}
      >
        <div className="bg-surface rounded-2xl px-[18px] pt-5 pb-[17px] text-center">
          <h2 id={titleId} className="text-ink text-section leading-[27px]">
            로그아웃하시겠어요?
          </h2>
          <p id={descriptionId} className="text-muted mt-2.5 text-[12px] leading-[19px]">
            로그아웃해도 신청 내역은
            <br />
            그대로 유지됩니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3.5">
            <Button
              autoFocus
              variant="secondary"
              size="md"
              className="h-[42px] rounded-[10px]! text-[13px] font-bold"
              onClick={closeDialog}
            >
              취소
            </Button>
            <Button
              size="md"
              className="h-[42px] rounded-[10px]! text-[13px] font-bold"
              loading={logout.isPending}
              onClick={confirmLogout}
            >
              로그아웃
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
