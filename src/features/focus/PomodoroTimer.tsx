import type { SessionType, TimerStatus } from "../../types/pomodoro";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";

interface PomodoroTimerProps {
  remainingSeconds: number;
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
    <div className="pomodoro-timer">
      <TimerDisplay
        remainingSeconds={remainingSeconds}
        durationSeconds={durationSeconds}
        sessionType={sessionType}
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
