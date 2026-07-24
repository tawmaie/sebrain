import type { Project } from "../../types/project";
import type { Task } from "../../types/task";
import { EmptyState } from "../../components/common/EmptyState";
import { TaskRow } from "./TaskRow";
import { cn, listStack } from "../../lib/ui";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TaskList({
  tasks,
  projects,
  selectedId,
  onSelect,
}: TaskListProps) {
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="ยังไม่มีงาน"
        description="เพิ่มงานใหม่ หรือแปลงจาก Inbox"
      />
    );
  }

  return (
    <div className={cn(listStack, "border-t-0")}>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          project={task.projectId ? projectMap.get(task.projectId) ?? null : null}
          selected={selectedId === task.id}
          onSelect={() => onSelect(task.id)}
        />
      ))}
    </div>
  );
}
