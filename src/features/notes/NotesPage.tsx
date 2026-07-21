import { useCallback, useEffect, useMemo, useState } from "react";
import type { Note } from "../../types/note";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "../../repositories/noteRepository";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { NoteList } from "./NoteList";
import { NoteEditor } from "./NoteEditor";
import {
  btnPrimary,
  chip,
  chipActive,
  panelHeader,
  panelTitle,
} from "../../lib/ui";

interface NotesPageProps {
  searchQuery: string;
}

export function NotesPage({ searchQuery }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotes({ includeArchived: showArchived });
      setNotes(data);
      setSelectedId((current) => {
        if (current && data.some((note) => note.id === current)) {
          return current;
        }
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return notes;
    }
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.contentMarkdown.toLowerCase().includes(query),
    );
  }, [notes, searchQuery]);

  const selected = notes.find((note) => note.id === selectedId) ?? null;

  const handleSave = useCallback(
    async (patch: { title: string; contentMarkdown: string }) => {
      if (!selectedId) return;
      await updateNote(selectedId, patch);
      const data = await listNotes({ includeArchived: showArchived });
      setNotes(data);
    },
    [selectedId, showArchived],
  );

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(300px,360px)_minmax(360px,1fr)] max-[1100px]:grid-cols-1">
      <section className="min-h-0 overflow-auto border-r border-border bg-surface-muted p-5 max-[1100px]:max-h-[40%] max-[1100px]:border-r-0 max-[1100px]:border-b">
        <div className={panelHeader}>
          <h2 className={panelTitle}>Notes</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={showArchived ? chipActive : chip}
              onClick={() => setShowArchived((value) => !value)}
            >
              เก็บถาวร
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                void (async () => {
                  try {
                    const created = await createNote({ title: "โน้ตไม่มีชื่อ" });
                    await load();
                    setSelectedId(created.id);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  }
                })();
              }}
            >
              สร้างโน้ต
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : null}
        {!loading && error ? (
          <ErrorMessage message={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error ? (
          <NoteList
            notes={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : null}
      </section>

      <section className="min-h-0 overflow-auto bg-surface p-5">
        <NoteEditor
          note={selected}
          onSave={handleSave}
          onTogglePin={async () => {
            if (!selected) return;
            await updateNote(selected.id, { isPinned: !selected.isPinned });
            await load();
          }}
          onToggleArchive={async () => {
            if (!selected) return;
            await updateNote(selected.id, {
              isArchived: !selected.isArchived,
            });
            await load();
          }}
          onDelete={() => {
            if (selected) {
              setDeleteId(selected.id);
            }
          }}
        />
      </section>

      <ConfirmDialog
        open={deleteId !== null}
        title="ลบโน้ตนี้"
        message="โน้ตนี้จะถูกลบอย่างถาวรและกู้กลับไม่ได้"
        confirmLabel="ลบโน้ต"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void (async () => {
            if (!deleteId) return;
            try {
              await deleteNote(deleteId);
              setDeleteId(null);
              setSelectedId(null);
              await load();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          })();
        }}
      />
    </div>
  );
}
