import type { InboxItem } from "../../types/inbox";
import {
  btn,
  btnDanger,
  btnPrimary,
  input as inputClass,
  listRow,
  listRowMeta,
  listRowTitle,
} from "../../lib/ui";

interface InboxItemRowProps {
  item: InboxItem;
  editing: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onConvertTask: () => void;
  onConvertNote: () => void;
}

export function InboxItemRow({
  item,
  editing,
  draft,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onConvertTask,
  onConvertNote,
}: InboxItemRowProps) {
  return (
    <article className={listRow}>
      {editing ? (
        <div className="flex w-full flex-col gap-2">
          <input
            type="text"
            className={inputClass}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSaveEdit();
              }
              if (event.key === "Escape") {
                onCancelEdit();
              }
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={onSaveEdit}
            >
              บันทึก
            </button>
            <button type="button" className={btn} onClick={onCancelEdit}>
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className={listRowTitle}>{item.content}</p>
            <p className={listRowMeta}>
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={btn} onClick={onConvertTask}>
              เป็นงาน
            </button>
            <button type="button" className={btn} onClick={onConvertNote}>
              เป็นโน้ต
            </button>
            <button type="button" className={btn} onClick={onStartEdit}>
              แก้ไข
            </button>
            <button
              type="button"
              className={btnDanger}
              onClick={onDelete}
            >
              ลบ
            </button>
          </div>
        </>
      )}
    </article>
  );
}
