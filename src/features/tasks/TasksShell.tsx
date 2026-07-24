import { useState } from "react";
import type { TaskSubView } from "../../types/taskSubView";
import { TaskSubNav } from "./TaskSubNav";
import { TasksPage } from "./TasksPage";
import { TasksDashboardPage } from "./TasksDashboardPage";
import { TasksCalendarPage } from "./TasksCalendarPage";

interface TasksShellProps {
  searchQuery: string;
}

export function TasksShell({ searchQuery }: TasksShellProps) {
  const [subView, setSubView] = useState<TaskSubView>("list");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TaskSubNav subView={subView} onChange={setSubView} />
      <div className="min-h-0 flex-1 overflow-hidden">
        {subView === "list" ? <TasksPage searchQuery={searchQuery} /> : null}
        {subView === "dashboard" ? <TasksDashboardPage /> : null}
        {subView === "calendar" ? <TasksCalendarPage /> : null}
      </div>
    </div>
  );
}
