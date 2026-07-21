import { useCallback, useEffect, useMemo, useState } from "react";
import type { InboxItem } from "../../types/inbox";
import {
  convertInboxToNote,
  convertInboxToTask,
  createInboxItem,
  deleteInboxItem,
  listInboxItems,
  updateInboxItem,
} from "../../repositories/inboxRepository";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { QuickCapture } from "./QuickCapture";
import { InboxItemRow } from "./InboxItemRow";

interface InboxPageProps {
  searchQuery: string;
  captureRequestId: number;
  onCountChange?: (count: number) => void;
}

export function InboxPage({
  searchQuery,
  captureRequestId,
  onCountChange,
}: InboxPageProps) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [focusCapture, setFocusCapture] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInboxItems();
      setItems(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (captureRequestId > 0) {
      setFocusCapture(true);
    }
  }, [captureRequestId]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter((item) => item.content.toLowerCase().includes(query));
  }, [items, searchQuery]);

  return (
    <div className="panel-single">
      <div className="panel-header">
        <h2>Inbox</h2>
      </div>
      <QuickCapture
        autoFocus={focusCapture}
        placeholder="พิมพ์สิ่งที่คิดไว้... กด Enter เพื่อบันทึก"
        onSubmit={async (content) => {
          await createInboxItem(content);
          await load();
        }}
      />

      {loading ? <LoadingState label="กำลังโหลด Inbox..." /> : null}
      {!loading && error ? (
        <ErrorMessage message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title="ยังไม่มีอะไรใน Inbox"
          description="จดไอเดียแรกที่ช่องด้านบน แล้วกด Enter"
        />
      ) : null}

      <div className="list-stack">
        {filtered.map((item) => (
          <InboxItemRow
            key={item.id}
            item={item}
            editing={editingId === item.id}
            draft={draft}
            onDraftChange={setDraft}
            onStartEdit={() => {
              setEditingId(item.id);
              setDraft(item.content);
            }}
            onCancelEdit={() => {
              setEditingId(null);
              setDraft("");
            }}
            onSaveEdit={() => {
              void (async () => {
                try {
                  await updateInboxItem(item.id, draft);
                  setEditingId(null);
                  setDraft("");
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                }
              })();
            }}
            onDelete={() => setDeleteId(item.id)}
            onConvertTask={() => {
              void (async () => {
                try {
                  await convertInboxToTask(item.id);
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                }
              })();
            }}
            onConvertNote={() => {
              void (async () => {
                try {
                  await convertInboxToNote(item.id);
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                }
              })();
            }}
          />
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="ลบรายการนี้"
        message="รายการนี้จะถูกลบอย่างถาวรและกู้กลับไม่ได้"
        confirmLabel="ลบ"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void (async () => {
            if (!deleteId) return;
            try {
              await deleteInboxItem(deleteId);
              setDeleteId(null);
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
