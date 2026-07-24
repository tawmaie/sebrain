import type { SessionType, TimerStatus } from "../../types/pomodoro";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";

interface PomodoroTimerProps {
  remainingSeconds: number;
  overtimeSeconds: number;
  durationSeconds: number;
  sessionType: SessionType;
  status: TimerStatus;
  taskLabel?: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
}

export function PomodoroTimer({
  remainingSeconds,
  overtimeSeconds,
  durationSeconds,
  sessionType,
  status,
  taskLabel,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinishEarly,
}: PomodoroTimerProps) {
  return (
    <div className="rounded-card border border-border bg-surface px-5 py-6 shadow-[0_8px_24px_rgba(24,24,24,0.06)]">
      <TimerDisplay
        remainingSeconds={remainingSeconds}
        overtimeSeconds={overtimeSeconds}
        durationSeconds={durationSeconds}
        sessionType={sessionType}
        status={status}
        taskLabel={taskLabel}
      />
      <TimerControls
        status={status}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onReset={onReset}
        onFinishEarly={onFinishEarly}
      />
    </div>
  );
}
