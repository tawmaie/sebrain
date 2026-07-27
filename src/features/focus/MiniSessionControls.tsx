import { ExternalLink, LayoutGrid, ScrollText } from "lucide-react";
import type { SessionType, TimerStatus } from "../../types/pomodoro";
import type { Task } from "../../types/task";
import {
  exitMiniMode,
  openTaskDetailWindow,
  openWorkLogWindow,
} from "../../services/windowService";
import { btn, field, input as inputClass } from "../../lib/ui";

interface MiniSessionControlsProps {
  tasks: Task[];
  loadingTasks: boolean;
  sessionType: SessionType;
  taskId: string | null;
  status: TimerStatus;
  onSessionTypeChange: (type: SessionType) => void;
  onTaskIdChange: (taskId: string | null) => void;
}

export function MiniSessionControls({
  tasks,
  loadingTasks,
  sessionType,
  taskId,
  status,
  onSessionTypeChange,
  onTaskIdChange,
}: MiniSessionControlsProps) {
  const locked =
    status === "running" || status === "paused" || status === "overtime";

  return (
    <div className="flex flex-col gap-3">
      <label className={field}>
        <span className="text-[10px] font-medium text-text-secondary">
          โหมด
        </span>
        <select
          className={`${inputClass} min-h-8 py-1 text-xs`}
          value={sessionType}
          disabled={locked}
          onChange={(event) =>
            onSessionTypeChange(event.target.value as SessionType)
          }
        >
          <option value="focus">Focus</option>
          <option value="short_break">Short break</option>
          <option value="long_break">Long break</option>
        </select>
      </label>

      <label className={field}>
        <span className="text-[10px] font-medium text-text-secondary">
          เคสที่ทำ
        </span>
        <select
          className={`${inputClass} min-h-8 py-1 text-xs`}
          value={taskId ?? ""}
          disabled={locked || loadingTasks}
          onChange={(event) => onTaskIdChange(event.target.value || null)}
        >
          <option value="">ไม่ผูกกับงาน</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          className={`${btn} inline-flex min-h-8 w-full items-center justify-center gap-1.5 px-2 py-1 text-xs`}
          disabled={!taskId}
          onClick={() => {
            if (taskId) {
              void openTaskDetailWindow(taskId);
            }
          }}
        >
          <ExternalLink size={12} />
          เปิดเคส
        </button>
        <button
          type="button"
          className={`${btn} inline-flex min-h-8 w-full items-center justify-center gap-1.5 px-2 py-1 text-xs`}
          onClick={() => {
            void openWorkLogWindow();
          }}
        >
          <ScrollText size={12} />
          บันทึก log
        </button>
        <button
          type="button"
          className={`${btn} inline-flex min-h-8 w-full items-center justify-center gap-1.5 px-2 py-1 text-xs`}
          onClick={() => {
            void exitMiniMode();
          }}
        >
          <LayoutGrid size={12} />
          กลับแอปหลัก
        </button>
      </div>
    </div>
  );
}
