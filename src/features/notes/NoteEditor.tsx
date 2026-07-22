import { useEffect, useRef, useState } from "react";
import type { Note } from "../../types/note";
import { MarkdownPreview } from "./MarkdownPreview";
import { btn, btnDanger, chip, chipActive, cn, masterDetailEmpty } from "../../lib/ui";

interface NoteEditorProps {
  note: Note | null;
  onSave: (patch: { title: string; contentMarkdown: string }) => Promise<void>;
  onTogglePin: () => Promise<void>;
  onToggleArchive: () => Promise<void>;
  onDelete: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function NoteEditor({
  note,
  onSave,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const noteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!note) {
      return;
    }
    noteIdRef.current = note.id;
    setTitle(note.title);
    setContent(note.contentMarkdown);
    setSaveState("idle");
    setLastSavedAt(note.updatedAt);
    setError(null);
    // Reset local editor state only when switching notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  useEffect(() => {
    if (!note || noteIdRef.current !== note.id) {
      return;
    }

    if (title === note.title && content === note.contentMarkdown) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      void (async () => {
        setSaveState("saving");
        setError(null);
        try {
          await onSave({ title, contentMarkdown: content });
          setSaveState("saved");
          setLastSavedAt(new Date().toISOString());
        } catch (err) {
          setSaveState("error");
          setError(err instanceof Error ? err.message : String(err));
        }
      })();
    }, 600);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [title, content, note, onSave]);

  if (!note) {
    return (
      <div className={masterDetailEmpty}>
        <p>เลือกโน้ตทางซ้ายเพื่อแก้ไข</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <input
          className="w-full !border-none !bg-transparent !p-1 text-lg font-semibold"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={mode === "edit" ? chipActive : chip}
            onClick={() => setMode("edit")}
          >
            Write
          </button>
          <button
            type="button"
            className={mode === "split" ? chipActive : chip}
            onClick={() => setMode("split")}
          >
            Split
          </button>
          <button
            type="button"
            className={mode === "preview" ? chipActive : chip}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="mb-2 text-xs text-text-secondary">
        {saveState === "saving"
          ? "กำลังบันทึก..."
          : saveState === "saved" && lastSavedAt
            ? `บันทึกแล้ว ${new Date(lastSavedAt).toLocaleTimeString()}`
            : saveState === "error"
              ? "บันทึกไม่สำเร็จ"
              : lastSavedAt
                ? `บันทึกแล้ว ${new Date(lastSavedAt).toLocaleTimeString()}`
                : ""}
      </div>
      {error ? <p className="mt-2 mb-0 text-xs text-danger">{error}</p> : null}

      <div
        className={cn(
          "mt-2 grid min-h-0 flex-1 gap-3 overflow-auto",
          mode === "split" && "grid-cols-2 max-[1100px]:grid-cols-1",
        )}
      >
        {mode !== "preview" ? (
          <div className="flex min-h-0 flex-col">
            <textarea
              className="min-h-[200px] w-full flex-1 resize-y rounded-input border border-border-strong bg-surface px-3 py-[9px] font-mono text-sm leading-[1.7] max-[1100px]:min-h-[180px]"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="เขียน Markdown ที่นี่..."
            />
          </div>
        ) : null}
        {mode !== "edit" ? (
          <div className="min-h-0 overflow-auto">
            <MarkdownPreview content={content} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex shrink-0 flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => void onTogglePin()}>
          {note.isPinned ? "เลิกปักหมุด" : "ปักหมุด"}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => void onToggleArchive()}
        >
          {note.isArchived ? "กู้คืน" : "เก็บถาวร"}
        </button>
        <button
          type="button"
          className={btnDanger}
          onClick={onDelete}
        >
          ลบโน้ต
        </button>
      </div>
    </div>
  );
}
