import type { Task } from "../../types/task";
import { EmptyState } from "../../components/common/EmptyState";
import { TaskRow } from "./TaskRow";
import { cn, listStack } from "../../lib/ui";

interface TaskListProps {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
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
          selected={selectedId === task.id}
          onSelect={() => onSelect(task.id)}
        />
      ))}
    </div>
  );
}
