interface TimerDisplayProps {
  remainingSeconds: number;
  durationSeconds: number;
  sessionType: string;
  taskLabel?: string | null;
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
  durationSeconds,
  sessionType,
  taskLabel,
}: TimerDisplayProps) {
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

  return (
    <div className="mb-4 text-center">
      <p className="m-0 text-xs font-semibold tracking-[0.08em] text-text-secondary uppercase">
        {modeLabel[sessionType] ?? sessionType}
      </p>
      <p className="my-2 text-[60px] font-bold tracking-[0.02em] tabular-nums">
        {formatTime(remainingSeconds)}
      </p>
      <p className="mb-3 text-[13px] text-text-secondary">
        {taskLabel ? taskLabel : "ไม่ได้ผูกกับงาน"}
      </p>
      <div
        className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="zebra-fill h-full rounded-full transition-[width] duration-[250ms] ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
