import { useEffect, useState } from "react";
import type { Project } from "../../types/project";
import type { Task, TaskStatus } from "../../types/task";
import type { TaskLogEntry } from "../../types/taskLog";
import { listTaskLogEntries } from "../../repositories/taskLogRepository";
import { ProjectBadge } from "../../components/common/ProjectBadge";
import { formatLogDateTime } from "../log/workLogFormat";

interface CalendarTaskTooltipProps {
  task: Task;
  project: Project | null;
  anchorRect: DOMRect;
  onRequestClose: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  inbox: "Inbox",
  today: "Today",
  doing: "Doing",
  done: "Done",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function CalendarTaskTooltip({
  task,
  project,
  anchorRect,
  onRequestClose,
}: CalendarTaskTooltipProps) {
  const [logs, setLogs] = useState<TaskLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const entries = await listTaskLogEntries(task.id);
          if (!cancelled) {
            setLogs(entries);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [task.id]);

  const tooltipWidth = 280;
  const margin = 8;
  const left = clamp(
    anchorRect.left,
    margin,
    window.innerWidth - tooltipWidth - margin,
  );
  const preferBelow = anchorRect.bottom + 160 < window.innerHeight;
  const top = preferBelow
    ? anchorRect.bottom + 6
    : anchorRect.top - 6;

  const description = task.description.trim();
  const latestLog = logs[0] ?? null;

  return (
    <div
      className="pointer-events-none fixed z-50 w-[280px] rounded-card border border-border bg-surface p-3 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
      style={{
        left,
        top,
        transform: preferBelow ? undefined : "translateY(-100%)",
      }}
      role="tooltip"
      onMouseLeave={onRequestClose}
    >
      <p className="m-0 mb-1 text-sm font-semibold leading-snug">{task.title}</p>
      <p className="m-0 mb-2 text-xs text-text-secondary">
        {statusLabels[task.status]}
        {project ? (
          <>
            {" · "}
            <ProjectBadge project={project} />
          </>
        ) : null}
      </p>

      {description ? (
        <p className="m-0 mb-2 line-clamp-2 text-xs leading-relaxed text-text-primary">
          {description}
        </p>
      ) : null}

      <div className="border-t border-border pt-2">
        <p className="m-0 mb-1 text-[10px] font-semibold tracking-[0.08em] text-text-secondary uppercase">
          Log ล่าสุด
        </p>
        {loading ? (
          <p className="m-0 text-xs text-text-secondary">กำลังโหลด...</p>
        ) : latestLog ? (
          <div>
            <time
              className="text-[10px] text-text-secondary"
              dateTime={latestLog.createdAt}
            >
              {formatLogDateTime(latestLog.createdAt)}
            </time>
            <p className="m-0 mt-0.5 line-clamp-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
              {latestLog.body}
            </p>
            {logs.length > 1 ? (
              <p className="m-0 mt-1 text-[10px] text-text-secondary">
                +{logs.length - 1} บันทึกอื่น ๆ
              </p>
            ) : null}
          </div>
        ) : (
          <p className="m-0 text-xs text-text-secondary">ยังไม่มีบันทึก</p>
        )}
      </div>

      <p className="m-0 mt-2 text-[10px] text-text-secondary">
        คลิกเพื่อดูรายละเอียดทั้งหมด
      </p>
    </div>
  );
}
