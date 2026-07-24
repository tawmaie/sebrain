import type { TaskSubView } from "../../types/taskSubView";
import { cn } from "../../lib/ui";

interface TaskSubNavProps {
  subView: TaskSubView;
  onChange: (view: TaskSubView) => void;
}

const items: Array<{ id: TaskSubView; label: string }> = [
  { id: "list", label: "รายการ" },
  { id: "dashboard", label: "Dashboard" },
  { id: "calendar", label: "Calendar" },
];

export function TaskSubNav({ subView, onChange }: TaskSubNavProps) {
  return (
    <nav className="flex shrink-0 gap-1 border-b border-border bg-surface px-5 pt-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            "-mb-px border-0 border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-sm font-medium text-text-secondary hover:text-text-primary",
            subView === item.id &&
              "border-black font-semibold text-text-primary",
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
