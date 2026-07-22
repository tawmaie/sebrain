import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Note } from "../../types/note";
import type { Task, TaskStatus } from "../../types/task";
import { getNoteById, updateNote } from "../../repositories/noteRepository";
import { updateTask } from "../../repositories/taskRepository";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { MarkdownPreview } from "../notes/MarkdownPreview";
import { ensureTaskProgressNote } from "./taskNoteHelpers";
import {
  btn,
  btnDanger,
  btnPrimary,
  chip,
  chipActive,
  cn,
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

type NoteMode = "edit" | "preview";

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

  const [progressNote, setProgressNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteMode, setNoteMode] = useState<NoteMode>("edit");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const noteDebounceRef = useRef<number | null>(null);

  const loadProgressNote = useCallback(async (linkedNoteId: string | null) => {
    if (!linkedNoteId) {
      setProgressNote(null);
      setNoteContent("");
      return;
    }

    setNoteLoading(true);
    try {
      const note = await getNoteById(linkedNoteId);
      setProgressNote(note);
      setNoteContent(note?.contentMarkdown ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setNoteLoading(false);
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
    void loadProgressNote(task.linkedNoteId);
  }, [task, open, loadProgressNote]);

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

  useEffect(() => {
    if (!progressNote || noteMode !== "edit") {
      return;
    }

    if (noteDebounceRef.current) {
      window.clearTimeout(noteDebounceRef.current);
    }

    noteDebounceRef.current = window.setTimeout(() => {
      void (async () => {
        if (!progressNote || noteContent === progressNote.contentMarkdown) {
          return;
        }

        setNoteSaving(true);
        try {
          const updated = await updateNote(progressNote.id, {
            contentMarkdown: noteContent,
          });
          setProgressNote(updated);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setNoteSaving(false);
        }
      })();
    }, 600);

    return () => {
      if (noteDebounceRef.current) {
        window.clearTimeout(noteDebounceRef.current);
      }
    };
  }, [noteContent, progressNote, noteMode]);

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
        className="fixed top-0 right-0 z-50 flex h-full w-[min(480px,100vw)] flex-col border-l border-border bg-surface shadow-[-8px_0_32px_rgba(0,0,0,0.12)]"
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
              rows={4}
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
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                  โน้ตความคืบหน้า
                </p>
                <p className="m-0 text-xs text-text-secondary">
                  บันทึกว่าทำอะไรไปแล้วระหว่างทำงาน
                </p>
              </div>
              {progressNote ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={noteMode === "edit" ? chipActive : chip}
                    onClick={() => setNoteMode("edit")}
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className={noteMode === "preview" ? chipActive : chip}
                    onClick={() => setNoteMode("preview")}
                  >
                    ดูตัวอย่าง
                  </button>
                </div>
              ) : null}
            </div>

            {noteLoading ? (
              <p className="m-0 text-sm text-text-secondary">กำลังโหลดโน้ต...</p>
            ) : progressNote ? (
              <>
                {noteMode === "edit" ? (
                  <textarea
                    className={cn(inputClass, "min-h-[180px] font-mono text-[13px]")}
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                  />
                ) : (
                  <MarkdownPreview content={noteContent} />
                )}
                {noteSaving ? (
                  <p className="mt-2 mb-0 text-xs text-text-secondary">
                    กำลังบันทึกโน้ต...
                  </p>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                className={btn}
                disabled={noteLoading}
                onClick={() => {
                  void (async () => {
                    setNoteLoading(true);
                    try {
                      const note = await ensureTaskProgressNote(task);
                      setProgressNote(note);
                      setNoteContent(note.contentMarkdown);
                      const updatedTask = await updateTask(task.id, {
                        linkedNoteId: note.id,
                      });
                      onTaskUpdated(updatedTask);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setNoteLoading(false);
                    }
                  })();
                }}
              >
                สร้างโน้ตความคืบหน้า
              </button>
            )}
          </section>

          {error ? <p className="mb-4 text-xs text-danger">{error}</p> : null}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
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
        </div>
      </aside>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="ลบงานนี้?"
        message="งานและการเชื่อมโยงกับตัวจับเวลาจะถูกลบ โน้ตที่ผูกไว้จะยังคงอยู่"
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
