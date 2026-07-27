import { useEffect, useState } from "react";
import { PictureInPicture } from "lucide-react";
import type { SessionType, TimerStatus } from "../../types/pomodoro";
import {
  enterMiniMode,
  exitMiniMode,
  isMiniWindowVisible,
  isTauriApp,
} from "../../services/windowService";
import { btn } from "../../lib/ui";
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
  const [miniOpen, setMiniOpen] = useState(false);
  const canUseMiniMode = isTauriApp();

  useEffect(() => {
    if (!canUseMiniMode) {
      return;
    }

    void isMiniWindowVisible().then(setMiniOpen);
  }, [canUseMiniMode]);

  const handleToggleMini = async () => {
    if (miniOpen) {
      await exitMiniMode();
    } else {
      await enterMiniMode();
    }
    setMiniOpen(await isMiniWindowVisible());
  };

  return (
    <div className="rounded-card border border-border bg-surface px-5 py-6 shadow-[0_8px_24px_rgba(24,24,24,0.06)]">
      {canUseMiniMode ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className={`${btn} inline-flex items-center gap-1.5 text-xs`}
            aria-pressed={miniOpen}
            onClick={() => {
              void handleToggleMini();
            }}
          >
            <PictureInPicture size={14} />
            {miniOpen ? "ปิด Mini Timer" : "Mini Timer"}
          </button>
        </div>
      ) : null}

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
