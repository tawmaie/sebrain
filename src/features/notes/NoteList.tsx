import type { Note } from "../../types/note";
import { EmptyState } from "../../components/common/EmptyState";
import {
  cn,
  listRow,
  listRowClickable,
  listRowMeta,
  listRowSelected,
  listRowTitle,
  listStack,
} from "../../lib/ui";

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
    <div className={cn(listStack, "border-t-0")}>
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          className={cn(
            listRow,
            listRowClickable,
            selectedId === note.id && listRowSelected,
          )}
          onClick={() => onSelect(note.id)}
        >
          <div>
            <p className={listRowTitle}>
              {note.isPinned ? (
                <span
                  className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_2px_var(--color-accent-soft)]"
                  aria-label="ปักหมุด"
                />
              ) : null}
              {note.title}
              {note.isArchived ? " · เก็บถาวร" : ""}
            </p>
            <p className={listRowMeta}>
              อัปเดต {new Date(note.updatedAt).toLocaleString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
