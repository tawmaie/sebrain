import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "../../types/task";
import {
  btn,
  btnDanger,
  btnPrimary,
  field,
  fieldLabel,
  input as inputClass,
  masterDetailEmpty,
} from "../../lib/ui";

interface TaskEditorProps {
  task: Task | null;
  onSave: (patch: {
    title: string;
    description: string;
    status: TaskStatus;
    estimatedPomodoros: number;
    plannedDate: string | null;
  }) => Promise<void>;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => Promise<void>;
}

export function TaskEditor({
  task,
  onSave,
  onDelete,
  onStatusChange,
}: TaskEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("inbox");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [plannedDate, setPlannedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      return;
    }
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setEstimatedPomodoros(task.estimatedPomodoros);
    setPlannedDate(task.plannedDate ?? "");
    setError(null);
  }, [task]);

  if (!task) {
    return (
      <div className={masterDetailEmpty}>
        <p>เลือกงานทางซ้ายเพื่อแก้ไข</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <h3 className="mb-4 text-lg font-semibold">รายละเอียดงาน</h3>
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
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className={field}>
        <span className={fieldLabel}>สถานะ</span>
        <select
          className={inputClass}
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
        >
          <option value="inbox">Inbox</option>
          <option value="today">Today</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </label>
      <label className={field}>
        <span className={fieldLabel}>วันที่กำหนด</span>
        <input
          type="date"
          className={inputClass}
          value={plannedDate}
          onChange={(event) => setPlannedDate(event.target.value)}
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

      {error ? <p className="mt-2 mb-0 text-xs text-danger">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          disabled={saving}
          onClick={() => {
            void (async () => {
              setSaving(true);
              setError(null);
              try {
                await onSave({
                  title,
                  description,
                  status,
                  estimatedPomodoros,
                  plannedDate: plannedDate || null,
                });
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
          className={btn}
          onClick={() => void onStatusChange("today")}
        >
          ย้ายไปวันนี้
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => void onStatusChange("doing")}
        >
          เริ่มทำ
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => void onStatusChange("done")}
        >
          เสร็จแล้ว
        </button>
        <button
          type="button"
          className={btnDanger}
          onClick={onDelete}
        >
          ลบงาน
        </button>
      </div>
    </div>
  );
}
