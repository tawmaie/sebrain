import { useCallback, useEffect, useMemo, useState } from "react";
import type { Project } from "../../types/project";
import type { Task, TaskStatus } from "../../types/task";
import { listProjects } from "../../repositories/projectRepository";
import { listTasks } from "../../repositories/taskRepository";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { panelTitle } from "../../lib/ui";

const statusLabels: Record<TaskStatus, string> = {
  inbox: "Inbox",
  today: "Today",
  doing: "Doing",
  done: "Done",
};

export function TasksDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskData, projectData] = await Promise.all([
        listTasks(),
        listProjects(),
      ]);
      setTasks(taskData);
      setProjects(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      inbox: 0,
      today: 0,
      doing: 0,
      done: 0,
    };
    for (const task of tasks) {
      counts[task.status] += 1;
    }
    return counts;
  }, [tasks]);

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const projectCounts = useMemo(() => {
    const counts = new Map<string | null, number>();
    for (const task of tasks) {
      const key = task.projectId;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [tasks]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks
      .filter(
        (task) =>
          task.plannedDate &&
          task.plannedDate >= today &&
          task.status !== "done",
      )
      .sort((a, b) => (a.plannedDate ?? "").localeCompare(b.plannedDate ?? ""))
      .slice(0, 8);
  }, [tasks]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={() => void load()} />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <h2 className={`${panelTitle} mb-6`}>Dashboard</h2>

      <section className="mb-8">
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          สถานะงาน
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
            <div
              key={status}
              className="rounded-card border border-border bg-surface-muted p-4"
            >
              <p className="m-0 text-2xl font-bold">{statusCounts[status]}</p>
              <p className="m-0 mt-1 text-xs text-text-secondary">
                {statusLabels[status]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          ตาม Project
        </h3>
        {projectCounts.size === 0 ? (
          <p className="m-0 text-sm text-text-secondary">
            ยังไม่มีงาน — สร้าง project ใน Settings แล้วกำหนดให้งาน
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from(projectCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([projectId, count]) => {
                const project = projectId ? projectMap.get(projectId) : null;
                const label = project?.name ?? "ไม่มี project";
                const color = project?.color ?? "#9ca3af";

                return (
                  <div
                    key={projectId ?? "none"}
                    className="flex items-center justify-between rounded-card border border-border px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span
                        className="inline-block h-[9px] w-[9px] rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      {label}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {count} งาน
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          งานที่กำลังจะถึง
        </h3>
        {upcoming.length === 0 ? (
          <p className="m-0 text-sm text-text-secondary">
            ไม่มีงานที่กำหนดวันในอนาคต
          </p>
        ) : (
          <div className="flex flex-col gap-0 border-t border-border">
            {upcoming.map((task) => {
              const project = task.projectId
                ? projectMap.get(task.projectId)
                : null;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-3"
                >
                  <div>
                    <p className="m-0 text-sm font-semibold">{task.title}</p>
                    {project ? (
                      <p className="m-0 mt-1 text-xs text-text-secondary">
                        {project.name}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-text-secondary">
                    {task.plannedDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
