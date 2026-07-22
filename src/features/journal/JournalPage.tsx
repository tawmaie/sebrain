import { useCallback, useEffect, useMemo, useState } from "react";
import type { Entry } from "../../types/entry";
import {
  createEntry,
  deleteEntry,
  listEntries,
  updateEntry,
} from "../../repositories/entryRepository";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { NoteList } from "../notes/NoteList";
import { NoteEditor } from "../notes/NoteEditor";
import {
  dailyEntryTemplate,
  formatDailyTitle,
} from "../../lib/entryLabels";
import {
  btnPrimary,
  chip,
  chipActive,
  masterDetailList,
  masterDetailPage,
  masterDetailPanel,
  panelHeader,
  panelTitle,
} from "../../lib/ui";

interface JournalPageProps {
  searchQuery: string;
}

export function JournalPage({ searchQuery }: JournalPageProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEntries({
        type: "daily",
        includeArchived: showArchived,
      });
      setEntries(data);
      setSelectedId((current) => {
        if (current && data.some((entry) => entry.id === current)) {
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
      return entries;
    }
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.contentMarkdown.toLowerCase().includes(query),
    );
  }, [entries, searchQuery]);

  const selected = entries.find((entry) => entry.id === selectedId) ?? null;

  const handleSave = useCallback(
    async (patch: { title: string; contentMarkdown: string }) => {
      if (!selectedId) {
        return;
      }
      await updateEntry(selectedId, patch);
      await load();
    },
    [selectedId, load],
  );

  return (
    <div className={masterDetailPage}>
      <section className={masterDetailList}>
        <div className={panelHeader}>
          <div>
            <h2 className={panelTitle}>Journal</h2>
            <p className="m-0 mt-1 text-sm text-text-secondary">
              บันทึกประจำวัน
            </p>
          </div>
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
                    const created = await createEntry({
                      type: "daily",
                      title: formatDailyTitle(),
                      contentMarkdown: dailyEntryTemplate(),
                    });
                    await load();
                    setSelectedId(created.id);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  }
                })();
              }}
            >
              บันทึกวันนี้
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

      <section className={masterDetailPanel}>
        <NoteEditor
          note={selected}
          onSave={handleSave}
          onTogglePin={async () => {
            if (!selected) {
              return;
            }
            await updateEntry(selected.id, { isPinned: !selected.isPinned });
            await load();
          }}
          onToggleArchive={async () => {
            if (!selected) {
              return;
            }
            await updateEntry(selected.id, {
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
        title="ลบบันทึกนี้"
        message="บันทึก Journal นี้จะถูกลบอย่างถาวรและกู้กลับไม่ได้"
        confirmLabel="ลบบันทึก"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void (async () => {
            if (!deleteId) {
              return;
            }
            try {
              await deleteEntry(deleteId);
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
