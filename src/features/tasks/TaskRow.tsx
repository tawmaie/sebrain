import type { Project } from "../../types/project";
import type { Task } from "../../types/task";
import { ProjectBadge } from "../../components/common/ProjectBadge";
import {
  cn,
  listRow,
  listRowClickable,
  listRowMeta,
  listRowSelected,
  listRowTitle,
} from "../../lib/ui";

interface TaskRowProps {
  task: Task;
  project: Project | null;
  selected: boolean;
  onSelect: () => void;
}

const statusLabel: Record<Task["status"], string> = {
  inbox: "Inbox",
  today: "Today",
  doing: "Doing",
  done: "Done",
};

const statusDotColor: Record<Task["status"], string> = {
  inbox: "bg-text-disabled",
  today: "bg-black",
  doing: "bg-accent shadow-[0_0_0_2px_var(--color-accent-soft)]",
  done: "bg-border-strong",
};

export function TaskRow({ task, project, selected, onSelect }: TaskRowProps) {
  const isDone = task.status === "done";

  return (
    <button
      type="button"
      className={cn(
        listRow,
        listRowClickable,
        selected && listRowSelected,
      )}
      onClick={onSelect}
    >
      <div>
        <p
          className={cn(
            listRowTitle,
            isDone && "font-medium text-text-disabled line-through",
          )}
        >
          <span
            className={cn(
              "mr-2 inline-block h-[7px] w-[7px] shrink-0 rounded-full",
              statusDotColor[task.status],
            )}
            aria-hidden="true"
          />
          {task.title}
        </p>
        <p className={listRowMeta}>
          {statusLabel[task.status]} · {task.completedPomodoros}/
          {task.estimatedPomodoros} focus sessions
          {project ? (
            <>
              {" "}
              · <ProjectBadge project={project} />
            </>
          ) : null}
        </p>
      </div>
    </button>
  );
}
