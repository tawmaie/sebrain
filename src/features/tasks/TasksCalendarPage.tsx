import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "../../types/project";
import type { Task } from "../../types/task";
import { listProjects } from "../../repositories/projectRepository";
import { listTasks } from "../../repositories/taskRepository";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { CalendarTaskModal } from "./CalendarTaskModal";
import { CalendarTaskTooltip } from "./CalendarTaskTooltip";
import { btn, cn, panelTitle } from "../../lib/ui";

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const VISIBLE_TASKS_PER_DAY = 3;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildCalendarDays(month: Date): Array<{ date: Date; inMonth: boolean }> {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const days: Array<{ date: Date; inMonth: boolean }> = [];
  const cursor = new Date(start);

  for (let i = 0; i < 42; i += 1) {
    days.push({
      date: new Date(cursor),
      inMonth: cursor.getMonth() === month.getMonth(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

interface HoverTarget {
  task: Task;
  rect: DOMRect;
}

export function TasksCalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null);
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (hoverCloseTimer.current !== null) {
        window.clearTimeout(hoverCloseTimer.current);
      }
    };
  }, []);

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.plannedDate) {
        continue;
      }
      const existing = map.get(task.plannedDate) ?? [];
      existing.push(task);
      map.set(task.plannedDate, existing);
    }
    return map;
  }, [tasks]);

  const days = useMemo(() => buildCalendarDays(month), [month]);
  const todayKey = toDateKey(new Date());
  const monthLabel = month.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  const clearHoverTimer = () => {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };

  const openHover = (task: Task, rect: DOMRect) => {
    clearHoverTimer();
    setHoverTarget({ task, rect });
  };

  const scheduleCloseHover = () => {
    clearHoverTimer();
    hoverCloseTimer.current = window.setTimeout(() => {
      setHoverTarget(null);
      hoverCloseTimer.current = null;
    }, 120);
  };

  const openTaskModal = (task: Task) => {
    clearHoverTimer();
    setHoverTarget(null);
    setExpandedDayKey(null);
    setSelectedTask(task);
  };

  const renderTaskChip = (task: Task) => {
    const project = task.projectId ? projectMap.get(task.projectId) : null;

    return (
      <button
        key={task.id}
        type="button"
        className="w-full truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-80"
        style={{
          backgroundColor: project
            ? `${project.color}18`
            : "var(--color-surface-muted)",
          borderLeft: `2px solid ${project?.color ?? "#9ca3af"}`,
        }}
        onMouseEnter={(event) => {
          openHover(task, event.currentTarget.getBoundingClientRect());
        }}
        onMouseLeave={scheduleCloseHover}
        onFocus={(event) => {
          openHover(task, event.currentTarget.getBoundingClientRect());
        }}
        onBlur={scheduleCloseHover}
        onClick={() => openTaskModal(task)}
      >
        {task.title}
      </button>
    );
  };

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

  const selectedProject = selectedTask?.projectId
    ? projectMap.get(selectedTask.projectId) ?? null
    : null;

  const hoveredProject = hoverTarget?.task.projectId
    ? projectMap.get(hoverTarget.task.projectId) ?? null
    : null;

  return (
    <>
      <div className="h-full min-h-0 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className={panelTitle}>{monthLabel}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className={btn}
              aria-label="เดือนก่อนหน้า"
              onClick={() => setMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => setMonth(startOfMonth(new Date()))}
            >
              วันนี้
            </button>
            <button
              type="button"
              className={btn}
              aria-label="เดือนถัดไป"
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-border bg-border">
          {WEEKDAYS.map((label) => (
            <div
              key={label}
              className="bg-surface-muted px-2 py-2 text-center text-xs font-semibold text-text-secondary"
            >
              {label}
            </div>
          ))}

          {days.map(({ date, inMonth }) => {
            const key = toDateKey(date);
            const dayTasks = tasksByDate.get(key) ?? [];
            const visibleTasks = dayTasks.slice(0, VISIBLE_TASKS_PER_DAY);
            const hiddenTasks = dayTasks.slice(VISIBLE_TASKS_PER_DAY);
            const isToday = key === todayKey;
            const isExpanded = expandedDayKey === key;

            return (
              <div
                key={key}
                className={cn(
                  "relative min-h-[88px] bg-surface p-2",
                  !inMonth && "bg-surface-muted/60",
                )}
              >
                <p
                  className={cn(
                    "m-0 mb-1 text-xs font-medium",
                    isToday &&
                      "inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-white",
                    !inMonth && "text-text-disabled",
                  )}
                >
                  {date.getDate()}
                </p>
                <div className="flex flex-col gap-1">
                  {visibleTasks.map((task) => renderTaskChip(task))}
                  {hiddenTasks.length > 0 ? (
                    <div className="relative">
                      <button
                        type="button"
                        className="m-0 w-full border-0 bg-transparent p-0 text-left text-[10px] text-text-secondary hover:text-text-primary"
                        onClick={() =>
                          setExpandedDayKey((current) =>
                            current === key ? null : key,
                          )
                        }
                      >
                        +{hiddenTasks.length} อื่น ๆ
                      </button>
                      {isExpanded ? (
                        <div className="absolute top-full right-0 left-0 z-20 mt-1 flex flex-col gap-1 rounded-card border border-border bg-surface p-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                          {hiddenTasks.map((task) => renderTaskChip(task))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoverTarget && !selectedTask ? (
        <CalendarTaskTooltip
          task={hoverTarget.task}
          project={hoveredProject}
          anchorRect={hoverTarget.rect}
          onRequestClose={() => setHoverTarget(null)}
        />
      ) : null}

      <CalendarTaskModal
        task={selectedTask}
        project={selectedProject}
        open={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
