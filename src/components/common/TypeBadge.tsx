import type { EntryType } from "../../types/entry";
import type { TaskStatus } from "../../types/task";
import { getEntryTypeLabel } from "../../lib/entryLabels";
import { cn } from "../../lib/ui";

interface EntryTypeBadgeProps {
  type: EntryType;
  className?: string;
}

const badgeBase =
  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em] uppercase";

const typeStyles: Record<EntryType, string> = {
  note: "border-border bg-surface-muted text-text-secondary",
  task_progress: "border-accent bg-accent-soft text-success",
  daily: "border-border-strong bg-surface text-text-primary",
  meeting: "border-border bg-surface-muted text-text-secondary",
  idea: "border-border bg-surface-muted text-text-secondary",
};

export function EntryTypeBadge({ type, className }: EntryTypeBadgeProps) {
  return (
    <span className={cn(badgeBase, typeStyles[type], className)}>
      {getEntryTypeLabel(type)}
    </span>
  );
}

export function TaskStatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        badgeBase,
        "border-border bg-surface-muted text-text-secondary capitalize",
        className,
      )}
    >
      {status}
    </span>
  );
}

export function InboxBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        badgeBase,
        "border-border bg-surface-muted text-text-secondary",
        className,
      )}
    >
      Inbox
    </span>
  );
}
