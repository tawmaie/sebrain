import { useEffect, useRef } from "react";
import { btn, btnDanger, btnPrimary } from "../../lib/ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    confirmRef.current?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(24,24,24,0.45)]"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-[min(420px,calc(100vw-32px))] rounded-modal bg-surface p-5 shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-title" className="mb-2 text-base">
          {title}
        </h3>
        <p className="m-0 text-[13px] text-text-secondary">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btn} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={destructive ? btnDanger : btnPrimary}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
