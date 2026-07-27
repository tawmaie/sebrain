import { useState } from "react";
import { Minus, X } from "lucide-react";
import type { SessionType, TimerStatus } from "../../types/pomodoro";
import type { Task } from "../../types/task";
import { closeMiniWindow, startWindowDrag } from "../../services/windowService";
import { MiniSessionControls } from "./MiniSessionControls";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { cn } from "../../lib/ui";

type MiniTab = "timer" | "case";

interface MiniPomodoroWindowProps {
  remainingSeconds: number;
  overtimeSeconds: number;
  durationSeconds: number;
  sessionType: SessionType;
  status: TimerStatus;
  taskId: string | null;
  taskLabel?: string | null;
  tasks: Task[];
  loadingTasks: boolean;
  onSessionTypeChange: (type: SessionType) => void;
  onTaskIdChange: (taskId: string | null) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
}

const tabClass = (active: boolean) =>
  cn(
    "relative flex-1 border-0 bg-transparent py-2 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
    active
      ? "text-text-primary after:absolute after:right-5 after:bottom-0 after:left-5 after:h-0.5 after:bg-text-primary"
      : "text-text-secondary hover:text-text-primary",
  );

export function MiniPomodoroWindow({
  remainingSeconds,
  overtimeSeconds,
  durationSeconds,
  sessionType,
  status,
  taskId,
  taskLabel,
  tasks,
  loadingTasks,
  onSessionTypeChange,
  onTaskIdChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinishEarly,
}: MiniPomodoroWindowProps) {
  const [tab, setTab] = useState<MiniTab>("timer");

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-2.5 py-1.5">
        <button
          type="button"
          className="flex-1 cursor-grab border-0 bg-transparent p-0 text-left active:cursor-grabbing"
          aria-label="ลากเพื่อย้ายหน้าต่าง"
          onMouseDown={() => {
            void startWindowDrag();
          }}
        >
          <span className="text-[10px] font-semibold tracking-[0.08em] text-text-secondary uppercase">
            SeBrain Focus
          </span>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm border-0 bg-transparent text-text-secondary hover:bg-surface-muted"
            aria-label="กลับแอปหลัก"
            onClick={() => {
              void closeMiniWindow();
            }}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm border-0 bg-transparent text-text-secondary hover:bg-surface-muted"
            aria-label="ปิดหน้าต่าง"
            onClick={() => {
              void closeMiniWindow();
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <nav
        className="grid shrink-0 grid-cols-2 border-b border-border"
        aria-label="Mini mode tabs"
      >
        <button
          type="button"
          className={tabClass(tab === "timer")}
          aria-selected={tab === "timer"}
          onClick={() => setTab("timer")}
        >
          Timer
        </button>
        <button
          type="button"
          className={cn(
            tabClass(tab === "case"),
            "border-l border-border",
          )}
          aria-selected={tab === "case"}
          onClick={() => setTab("case")}
        >
          เคส
        </button>
      </nav>

      <div className="min-h-0 flex-1 overflow-auto px-4 pt-3 pb-3">
        {tab === "timer" ? (
          <div className="flex h-full min-h-[194px] flex-col justify-between">
            <TimerDisplay
              variant="mini"
              remainingSeconds={remainingSeconds}
              overtimeSeconds={overtimeSeconds}
              durationSeconds={durationSeconds}
              sessionType={sessionType}
              status={status}
              taskLabel={taskLabel}
            />
            <TimerControls
              variant="mini"
              status={status}
              onStart={onStart}
              onPause={onPause}
              onResume={onResume}
              onReset={onReset}
              onFinishEarly={onFinishEarly}
            />
          </div>
        ) : (
          <MiniSessionControls
            tasks={tasks}
            loadingTasks={loadingTasks}
            sessionType={sessionType}
            taskId={taskId}
            status={status}
            onSessionTypeChange={onSessionTypeChange}
            onTaskIdChange={onTaskIdChange}
          />
        )}
      </div>
    </div>
  );
}
