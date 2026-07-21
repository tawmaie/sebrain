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
    <div className="timer-display">
      <p className="timer-mode">{modeLabel[sessionType] ?? sessionType}</p>
      <p className="timer-digits">{formatTime(remainingSeconds)}</p>
      <p className="timer-task">{taskLabel ? taskLabel : "ไม่ได้ผูกกับงาน"}</p>
      <div
        className="timer-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="timer-progress-fill zebra-pattern"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
