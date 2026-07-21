import type { InboxItem } from "../../types/inbox";

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
    <article className="list-row">
      {editing ? (
        <div className="list-row-edit">
          <input
            type="text"
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
          <div className="row-actions">
            <button type="button" className="btn btn-primary" onClick={onSaveEdit}>
              บันทึก
            </button>
            <button type="button" className="btn" onClick={onCancelEdit}>
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="list-row-main">
            <p className="list-row-title">{item.content}</p>
            <p className="list-row-meta">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="row-actions">
            <button type="button" className="btn" onClick={onConvertTask}>
              เป็นงาน
            </button>
            <button type="button" className="btn" onClick={onConvertNote}>
              เป็นโน้ต
            </button>
            <button type="button" className="btn" onClick={onStartEdit}>
              แก้ไข
            </button>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              ลบ
            </button>
          </div>
        </>
      )}
    </article>
  );
}
