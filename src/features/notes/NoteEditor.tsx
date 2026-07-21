import { useEffect, useRef, useState } from "react";
import type { Note } from "../../types/note";
import { MarkdownPreview } from "./MarkdownPreview";

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
      <div className="detail-empty">
        <p>เลือกโน้ตทางซ้ายเพื่อแก้ไข</p>
      </div>
    );
  }

  return (
    <div className="detail-panel note-editor">
      <div className="panel-header compact">
        <input
          className="title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="row-actions">
          <button
            type="button"
            className={mode === "edit" ? "chip is-active" : "chip"}
            onClick={() => setMode("edit")}
          >
            Write
          </button>
          <button
            type="button"
            className={mode === "split" ? "chip is-active" : "chip"}
            onClick={() => setMode("split")}
          >
            Split
          </button>
          <button
            type="button"
            className={mode === "preview" ? "chip is-active" : "chip"}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="save-indicator">
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
      {error ? <p className="inline-error">{error}</p> : null}

      <div
        className={
          mode === "split" ? "note-workspace split" : "note-workspace"
        }
      >
        {mode !== "preview" ? (
          <div className="note-content-wrap">
            <textarea
              className="markdown-editor"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="เขียน Markdown ที่นี่..."
            />
          </div>
        ) : null}
        {mode !== "edit" ? (
          <div className="note-content-wrap">
            <MarkdownPreview content={content} />
          </div>
        ) : null}
      </div>

      <div className="row-actions wrap">
        <button type="button" className="btn" onClick={() => void onTogglePin()}>
          {note.isPinned ? "เลิกปักหมุด" : "ปักหมุด"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void onToggleArchive()}
        >
          {note.isArchived ? "กู้คืน" : "เก็บถาวร"}
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          ลบโน้ต
        </button>
      </div>
    </div>
  );
}
