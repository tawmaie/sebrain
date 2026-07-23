import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "../../types/task";
import type { TaskLogEntryWithTask } from "../../types/taskLog";
import { listTasks } from "../../repositories/taskRepository";
import {
  deleteTaskLogEntry,
  listRecentTaskLogEntries,
} from "../../repositories/taskLogRepository";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { WorkLogFeed } from "./WorkLogFeed";
import {
  chip,
  chipActive,
  field,
  input as inputClass,
  panelHeader,
  panelTitle,
} from "../../lib/ui";

interface LogPageProps {
  searchQuery: string;
}

export function LogPage({ searchQuery }: LogPageProps) {
  const [entries, setEntries] = useState<TaskLogEntryWithTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [logEntries, taskRows] = await Promise.all([
        listRecentTaskLogEntries({
          taskId: taskFilter || undefined,
          limit: 200,
        }),
        listTasks(),
      ]);
      setEntries(logEntries);
      setTasks(taskRows.filter((task) => task.status !== "done"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [taskFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return entries;
    }
    return entries.filter(
      (entry) =>
        entry.body.toLowerCase().includes(query) ||
        entry.taskTitle.toLowerCase().includes(query),
    );
  }, [entries, searchQuery]);

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <div className={panelHeader}>
        <div>
          <h2 className={panelTitle}>Log</h2>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            บันทึกการทำงานทุกเคส
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className={`${field} mb-0 min-w-[220px] flex-1`}>
          <span className="text-xs font-medium text-text-secondary">
            กรองตามงาน
          </span>
          <select
            className={inputClass}
            value={taskFilter}
            onChange={(event) => setTaskFilter(event.target.value)}
          >
            <option value="">ทุกงาน</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>

        {taskFilter ? (
          <button
            type="button"
            className={chipActive}
            onClick={() => setTaskFilter("")}
          >
            ล้างตัวกรอง
          </button>
        ) : (
          <span className={chip}>{filtered.length} รายการ</span>
        )}
      </div>

      {loading ? <LoadingState /> : null}
      {!loading && error ? (
        <ErrorMessage message={error} onRetry={() => void load()} />
      ) : null}

      {!loading && !error ? (
        <WorkLogFeed
          entries={filtered}
          showTaskTitle
          onDelete={async (id) => {
            await deleteTaskLogEntry(id);
            await load();
          }}
          onTaskTitleClick={(taskId) => setTaskFilter(taskId)}
        />
      ) : null}
    </div>
  );
}
