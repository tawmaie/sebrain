import { btnPrimary } from "../../lib/ui";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="grid gap-3 rounded-card border border-danger bg-danger-soft p-4 text-[#9b2c2c]"
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className={btnPrimary}
          onClick={onRetry}
        >
          ลองอีกครั้ง
        </button>
      ) : null}
    </div>
  );
}
