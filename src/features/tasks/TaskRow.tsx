import type { Task } from "../../types/task";

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
}

const statusLabel: Record<Task["status"], string> = {
  inbox: "Inbox",
  today: "Today",
  doing: "Doing",
  done: "Done",
};

export function TaskRow({ task, selected, onSelect }: TaskRowProps) {
  const isDone = task.status === "done";

  return (
    <button
      type="button"
      className={
        selected ? "list-row is-selected clickable" : "list-row clickable"
      }
      onClick={onSelect}
    >
      <div className="list-row-main">
        <p className={isDone ? "list-row-title is-done" : "list-row-title"}>
          <span className={`status-dot status-${task.status}`} aria-hidden="true" />
          {task.title}
        </p>
        <p className="list-row-meta">
          {statusLabel[task.status]} · {task.completedPomodoros}/
          {task.estimatedPomodoros} focus sessions
        </p>
      </div>
    </button>
  );
}
