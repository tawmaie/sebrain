import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Task, TaskStatus } from "../../types/task";
import type { TaskLogEntry } from "../../types/taskLog";
import { updateTask } from "../../repositories/taskRepository";
import {
  createTaskLogEntry,
  deleteTaskLogEntry,
  listTaskLogEntries,
} from "../../repositories/taskLogRepository";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { WorkLogCompose } from "../log/WorkLogCompose";
import { WorkLogFeed } from "../log/WorkLogFeed";
import {
  btn,
  btnDanger,
  btnPrimary,
  field,
  fieldLabel,
  input as inputClass,
} from "../../lib/ui";

interface TaskDetailDrawerProps {
  task: Task | null;
  pomodoroTaskId: string | null;
  open: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
  onStatusChange: (
    taskId: string,
    status: Extract<TaskStatus, "today" | "doing" | "done">,
  ) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskDetailDrawer({
  task,
  pomodoroTaskId,
  open,
  onClose,
  onTaskUpdated,
  onStatusChange,
  onDelete,
}: TaskDetailDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [logEntries, setLogEntries] = useState<TaskLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const loadLogs = useCallback(async (taskId: string) => {
    setLogLoading(true);
    try {
      const entries = await listTaskLogEntries(taskId);
      setLogEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!task || !open) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description);
    setEstimatedPomodoros(task.estimatedPomodoros);
    setError(null);
    void loadLogs(task.id);
  }, [task, open, loadLogs]);

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

  const isUpdating = saving;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[rgba(24,24,24,0.35)]"
        role="presentation"
        onClick={onClose}
      />

      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-[min(520px,100vw)] flex-col border-l border-border bg-surface shadow-[-8px_0_32px_rgba(0,0,0,0.12)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
              รายละเอียดงาน
            </p>
            <h2
              id="task-detail-title"
              className="m-0 truncate text-lg font-semibold"
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
          <label className={field}>
            <span className={fieldLabel}>ชื่องาน</span>
            <input
              type="text"
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className={field}>
            <span className={fieldLabel}>รายละเอียด</span>
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="อธิบายงาน เป้าหมาย หรือขั้นตอนที่ต้องทำ..."
            />
          </label>

          <label className={field}>
            <span className={fieldLabel}>Focus sessions ที่ประมาณไว้</span>
            <input
              type="number"
              className={inputClass}
              min={1}
              value={estimatedPomodoros}
              onChange={(event) =>
                setEstimatedPomodoros(Number(event.target.value))
              }
            />
          </label>

          <div className="mb-5 flex flex-wrap gap-2">
            {task.status === "today" ? (
              <button
                type="button"
                className={btnPrimary}
                disabled={isUpdating}
                onClick={() => void onStatusChange(task.id, "doing")}
              >
                เริ่มทำ
              </button>
            ) : null}
            {task.status === "doing" ? (
              <>
                <button
                  type="button"
                  className={btn}
                  disabled={isUpdating}
                  onClick={() => void onStatusChange(task.id, "today")}
                >
                  พักไว้
                </button>
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={isUpdating}
                  onClick={() => void onStatusChange(task.id, "done")}
                >
                  เสร็จแล้ว
                </button>
              </>
            ) : null}
            {pomodoroTaskId === task.id ? (
              <span className="self-center text-xs text-success">
                กำลังใช้กับตัวจับเวลา
              </span>
            ) : null}
          </div>

          <section className="mb-5 rounded-card border border-border bg-surface-muted p-4">
            <div className="mb-3">
              <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                บันทึกการทำงาน
              </p>
              <p className="m-0 text-xs text-text-secondary">
                จดสิ่งที่ทำกับเคสนี้ รองรับคำสั่ง SQL และอักขระพิเศษ
              </p>
            </div>

            <WorkLogCompose
              onSubmit={async (body) => {
                await createTaskLogEntry({ taskId: task.id, body });
                await loadLogs(task.id);
              }}
            />

            <div className="mt-4 border-t border-border pt-4">
              <WorkLogFeed
                entries={logEntries}
                loading={logLoading}
                onDelete={async (id) => {
                  await deleteTaskLogEntry(id);
                  await loadLogs(task.id);
                }}
                emptyTitle="ยังไม่มีบันทึกสำหรับเคสนี้"
              />
            </div>
          </section>

          {error ? <p className="mb-4 text-xs text-danger">{error}</p> : null}
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimary}
              disabled={saving}
              onClick={() => {
                void (async () => {
                  setSaving(true);
                  setError(null);
                  try {
                    const updated = await updateTask(task.id, {
                      title,
                      description,
                      estimatedPomodoros,
                    });
                    onTaskUpdated(updated);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  } finally {
                    setSaving(false);
                  }
                })();
              }}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              className={btnDanger}
              onClick={() => setShowDeleteConfirm(true)}
            >
              ลบงาน
            </button>
          </div>
        </footer>
      </aside>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="ลบงานนี้?"
        message="งานและการเชื่อมโยงกับตัวจับเวลาจะถูกลบ บันทึกการทำงานจะยังคงอยู่"
        confirmLabel="ลบงาน"
        destructive
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          void onDelete(task.id);
        }}
      />
    </>
  );
}
