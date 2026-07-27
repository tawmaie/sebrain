interface TimerDisplayProps {
  remainingSeconds: number;
  overtimeSeconds: number;
  durationSeconds: number;
  sessionType: string;
  status: string;
  taskLabel?: string | null;
  variant?: "default" | "mini";
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const modeLabel: Record<string, string> = {
  focus: "FOCUS",
  short_break: "SHORT BREAK",
  long_break: "LONG BREAK",
};

export function TimerDisplay({
  remainingSeconds,
  overtimeSeconds,
  durationSeconds,
  sessionType,
  status,
  taskLabel,
  variant = "default",
}: TimerDisplayProps) {
  const isMini = variant === "mini";
  const isOvertime = status === "overtime";
  const progress =
    durationSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((durationSeconds - remainingSeconds) / durationSeconds) * 100,
          ),
        )
      : 0;
  const circleRadius = 55;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset =
    circleCircumference - (progress / 100) * circleCircumference;

  if (isMini) {
    const displayTime = isOvertime
      ? `+${formatTime(overtimeSeconds)}`
      : formatTime(remainingSeconds);

    return (
      <div className="flex flex-col items-center text-center">
        <div
          className="relative grid h-32 w-32 place-items-center"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <svg
            className="-rotate-90"
            width="128"
            height="128"
            viewBox="0 0 128 128"
            aria-hidden="true"
          >
            <circle
              cx="64"
              cy="64"
              r={circleRadius}
              fill="none"
              stroke="var(--color-surface-muted)"
              strokeWidth="5"
            />
            <circle
              cx="64"
              cy="64"
              r={circleRadius}
              fill="none"
              stroke={isOvertime ? "#f59e0b" : "var(--color-accent)"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleOffset}
              className="transition-[stroke-dashoffset] duration-[250ms] ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="m-0 text-[10px] font-semibold tracking-[0.08em] text-text-secondary uppercase">
              {modeLabel[sessionType] ?? sessionType}
            </p>
            <p
              className={
                isOvertime
                  ? "m-0 mt-1 text-[25px] leading-none font-bold tracking-[0.02em] tabular-nums text-[#b45309]"
                  : "m-0 mt-1 text-[25px] leading-none font-bold tracking-[0.02em] tabular-nums"
              }
            >
              {displayTime}
            </p>
            {isOvertime ? (
              <p className="m-0 mt-1 text-[10px] text-[#b45309]">
                เกินเวลาแล้ว
              </p>
            ) : null}
          </div>
        </div>
        <p className="m-0 mt-2 max-w-full truncate px-1 text-[10px] leading-tight text-text-secondary">
          {isOvertime
            ? "นับเวลาต่อ — กดจบโฟกัสเมื่อเสร็จงาน"
            : taskLabel
              ? taskLabel
              : "ไม่ได้ผูกกับงาน"}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 text-center">
      <p
        className="m-0 text-xs font-semibold tracking-[0.08em] text-text-secondary uppercase"
      >
        {modeLabel[sessionType] ?? sessionType}
      </p>
      {isOvertime ? (
        <>
          <p
            className="my-1 text-sm font-medium text-[#b45309]"
          >
            เกินเวลาแล้ว
          </p>
          <p
            className="my-2 text-[60px] font-bold tracking-[0.02em] tabular-nums text-[#b45309]"
          >
            +{formatTime(overtimeSeconds)}
          </p>
        </>
      ) : (
        <p
          className="my-2 text-[60px] font-bold tracking-[0.02em] tabular-nums"
        >
          {formatTime(remainingSeconds)}
        </p>
      )}
      <p
        className="mb-3 text-[13px] text-text-secondary"
      >
        {isOvertime
          ? "นับเวลาต่อ — กดจบโฟกัสเมื่อเสร็จงาน"
          : taskLabel
            ? taskLabel
            : "ไม่ได้ผูกกับงาน"}
      </p>
      <div
        className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={
            isOvertime
              ? "h-full rounded-full bg-[#f59e0b] transition-[width] duration-[250ms] ease-linear"
              : "zebra-fill h-full rounded-full transition-[width] duration-[250ms] ease-linear"
          }
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
