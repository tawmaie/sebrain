import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Project } from "../../types/project";
import type { Task, TaskStatus } from "../../types/task";
import type { TaskLogEntry } from "../../types/taskLog";
import { listTaskLogEntries } from "../../repositories/taskLogRepository";
import { ProjectBadge } from "../../components/common/ProjectBadge";
import { WorkLogFeed } from "../log/WorkLogFeed";
import { btn } from "../../lib/ui";

interface CalendarTaskModalProps {
  task: Task | null;
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  inbox: "Inbox",
  today: "Today",
  doing: "Doing",
  done: "Done",
};

export function CalendarTaskModal({
  task,
  project,
  open,
  onClose,
}: CalendarTaskModalProps) {
  const [logEntries, setLogEntries] = useState<TaskLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const loadLogs = useCallback(async (taskId: string) => {
    setLogLoading(true);
    try {
      const entries = await listTaskLogEntries(taskId);
      setLogEntries(entries);
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !task) {
      return;
    }

    setLogEntries([]);
    void loadLogs(task.id);
  }, [open, task, loadLogs]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!open || !task) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(24,24,24,0.45)] p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(85vh,720px)] w-[min(560px,100%)] flex-col overflow-hidden rounded-modal bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-task-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
              รายละเอียดงาน
            </p>
            <h2
              id="calendar-task-modal-title"
              className="m-0 text-lg font-semibold break-words"
            >
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-button border border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
            aria-label="ปิด"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <dl className="m-0 mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-text-secondary">สถานะ</dt>
            <dd className="m-0 font-medium">{statusLabels[task.status]}</dd>

            {project ? (
              <>
                <dt className="text-text-secondary">Project</dt>
                <dd className="m-0">
                  <ProjectBadge project={project} />
                </dd>
              </>
            ) : null}

            {task.plannedDate ? (
              <>
                <dt className="text-text-secondary">วันที่กำหนด</dt>
                <dd className="m-0 font-medium">{task.plannedDate}</dd>
              </>
            ) : null}

            <dt className="text-text-secondary">Focus</dt>
            <dd className="m-0 font-medium">
              {task.completedPomodoros}/{task.estimatedPomodoros} sessions
            </dd>
          </dl>

          {task.description.trim() ? (
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold tracking-[0.06em] text-text-secondary uppercase">
                รายละเอียด
              </h3>
              <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {task.description}
              </p>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-xs font-semibold tracking-[0.06em] text-text-secondary uppercase">
              บันทึกการทำงาน
            </h3>
            <WorkLogFeed
              entries={logEntries}
              loading={logLoading}
              emptyTitle="ยังไม่มีบันทึกสำหรับงานนี้"
            />
          </section>
        </div>

        <footer className="shrink-0 border-t border-border px-5 py-3">
          <button type="button" className={btn} onClick={onClose}>
            ปิด
          </button>
        </footer>
      </div>
    </div>
  );
}
