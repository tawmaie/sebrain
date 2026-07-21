import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "../../types/task";

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
      <div className="detail-empty">
        <p>เลือกงานทางซ้ายเพื่อแก้ไข</p>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      <h3>รายละเอียดงาน</h3>
      <label className="field">
        <span>ชื่องาน</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="field">
        <span>รายละเอียด</span>
        <textarea
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className="field">
        <span>สถานะ</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
        >
          <option value="inbox">Inbox</option>
          <option value="today">Today</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </label>
      <label className="field">
        <span>วันที่กำหนด</span>
        <input
          type="date"
          value={plannedDate}
          onChange={(event) => setPlannedDate(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Focus sessions ที่ประมาณไว้</span>
        <input
          type="number"
          min={1}
          value={estimatedPomodoros}
          onChange={(event) =>
            setEstimatedPomodoros(Number(event.target.value))
          }
        />
      </label>

      {error ? <p className="inline-error">{error}</p> : null}

      <div className="row-actions wrap">
        <button
          type="button"
          className="btn btn-primary"
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
          className="btn"
          onClick={() => void onStatusChange("today")}
        >
          ย้ายไปวันนี้
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void onStatusChange("doing")}
        >
          เริ่มทำ
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void onStatusChange("done")}
        >
          เสร็จแล้ว
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          ลบงาน
        </button>
      </div>
    </div>
  );
}
