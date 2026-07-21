import type { Note } from "../../types/note";
import { EmptyState } from "../../components/common/EmptyState";

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ notes, selectedId, onSelect }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="ยังไม่มีโน้ต"
        description="สร้างโน้ตแรกเพื่อเริ่มเก็บความคิดของคุณ"
      />
    );
  }

  return (
    <div className="list-stack">
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          className={
            selectedId === note.id
              ? "list-row is-selected clickable"
              : "list-row clickable"
          }
          onClick={() => onSelect(note.id)}
        >
          <div className="list-row-main">
            <p className="list-row-title">
              {note.isPinned ? (
                <span className="pin-dot" aria-label="ปักหมุด" />
              ) : null}
              {note.title}
              {note.isArchived ? " · เก็บถาวร" : ""}
            </p>
            <p className="list-row-meta">
              อัปเดต {new Date(note.updatedAt).toLocaleString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
