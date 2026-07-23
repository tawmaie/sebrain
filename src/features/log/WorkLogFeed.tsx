import { useState } from "react";
import type { TaskLogEntry, TaskLogEntryWithTask } from "../../types/taskLog";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { btnDanger, cn } from "../../lib/ui";
import { formatLogDateTime, formatLogTime } from "./workLogFormat";

interface WorkLogFeedProps {
  entries: Array<TaskLogEntry | TaskLogEntryWithTask>;
  loading?: boolean;
  showTaskTitle?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onTaskTitleClick?: (taskId: string) => void;
  emptyTitle?: string;
}

function hasTaskTitle(
  entry: TaskLogEntry | TaskLogEntryWithTask,
): entry is TaskLogEntryWithTask {
  return "taskTitle" in entry;
}

export function WorkLogFeed({
  entries,
  loading = false,
  showTaskTitle = false,
  onDelete,
  onTaskTitleClick,
  emptyTitle = "ยังไม่มีบันทึกการทำงาน",
}: WorkLogFeedProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return <LoadingState label="กำลังโหลดบันทึก..." />;
  }

  if (entries.length === 0) {
    return <EmptyState title={emptyTitle} compact />;
  }

  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-card border border-border bg-surface p-3"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <time
                  className="text-[11px] font-semibold text-text-secondary"
                  dateTime={entry.createdAt}
                >
                  {formatLogDateTime(entry.createdAt)}
                </time>
                {showTaskTitle && hasTaskTitle(entry) ? (
                  onTaskTitleClick ? (
                    <button
                      type="button"
                      className="mt-0.5 block max-w-full truncate border-none bg-transparent p-0 text-left text-sm font-semibold text-text-primary hover:underline"
                      onClick={() => onTaskTitleClick(entry.taskId)}
                    >
                      {entry.taskTitle}
                    </button>
                  ) : (
                    <p className="m-0 mt-0.5 truncate text-sm font-semibold">
                      {entry.taskTitle}
                    </p>
                  )
                ) : null}
              </div>
              {onDelete ? (
                <button
                  type="button"
                  className={cn(btnDanger, "shrink-0 px-2 py-1 text-xs")}
                  onClick={() => setDeleteId(entry.id)}
                >
                  ลบ
                </button>
              ) : null}
            </div>
            <pre className="m-0 overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-[1.6] text-text-primary">
              {entry.body}
            </pre>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteId !== null}
        title="ลบบันทึกนี้?"
        message="บันทึกการทำงานนี้จะถูกลบอย่างถาวรและกู้กลับไม่ได้"
        confirmLabel="ลบบันทึก"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void (async () => {
            if (!deleteId || !onDelete) {
              return;
            }
            await onDelete(deleteId);
            setDeleteId(null);
          })();
        }}
      />
    </>
  );
}

export { formatLogTime };
