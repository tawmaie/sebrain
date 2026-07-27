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
import { closeCurrentWindow } from "../../services/windowService";
import {
  btn,
  btnDanger,
  btnPrimary,
  field,
  fieldLabel,
  input as inputClass,
} from "../../lib/ui";

interface TaskDetailWindowProps {
  task: Task;
  pomodoroTaskId: string | null;
  onTaskUpdated: (task: Task) => void;
  onStatusChange: (
    taskId: string,
    status: Extract<TaskStatus, "today" | "doing" | "done">,
  ) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskDetailWindow({
  task,
  pomodoroTaskId,
  onTaskUpdated,
  onStatusChange,
  onDelete,
}: TaskDetailWindowProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    task.estimatedPomodoros,
  );
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
    setTitle(task.title);
    setDescription(task.description);
    setEstimatedPomodoros(task.estimatedPomodoros);
    setError(null);
    void loadLogs(task.id);
  }, [task, loadLogs]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
            รายละเอียดงาน
          </p>
          <h1 className="m-0 truncate text-lg font-semibold">{task.title}</h1>
        </div>
        <button
          type="button"
          className={`${btn} min-h-8 px-2`}
          aria-label="ปิด"
          onClick={() => {
            void closeCurrentWindow();
          }}
        >
          <X size={16} />
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
              disabled={saving}
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
                disabled={saving}
                onClick={() => void onStatusChange(task.id, "today")}
              >
                พักไว้
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={saving}
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
    </div>
  );
}
