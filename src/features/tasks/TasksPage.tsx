import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task, TaskStatus } from "../../types/task";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../../repositories/taskRepository";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { TaskList } from "./TaskList";
import { TaskEditor } from "./TaskEditor";
import { btnPrimary, cn, masterDetailList, masterDetailPage, masterDetailPanel, panelHeader, panelTitle } from "../../lib/ui";

interface TasksPageProps {
  searchQuery: string;
}

export function TasksPage({ searchQuery }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTasks();
      setTasks(data);
      setSelectedId((current) => {
        if (current && data.some((task) => task.id === current)) {
          return current;
        }
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (filter !== "all" && task.status !== filter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    });
  }, [tasks, filter, searchQuery]);

  const selected = tasks.find((task) => task.id === selectedId) ?? null;

  return (
    <div className={masterDetailPage}>
      <section className={masterDetailList}>
        <div className={panelHeader}>
          <h2 className={panelTitle}>Tasks</h2>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              void (async () => {
                try {
                  const created = await createTask({ title: "งานใหม่" });
                  await load();
                  setSelectedId(created.id);
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                }
              })();
            }}
          >
            เพิ่มงาน
          </button>
        </div>

        <div className="mb-4 flex gap-5 border-b border-border">
          {(["all", "inbox", "today", "doing", "done"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                "-mb-px border-0 border-b-2 border-transparent bg-transparent pb-3 pt-2 font-medium capitalize text-text-secondary hover:text-text-primary",
                filter === value && "border-black font-semibold text-text-primary",
              )}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>

        {loading ? <LoadingState /> : null}
        {!loading && error ? (
          <ErrorMessage message={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error ? (
          <TaskList
            tasks={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : null}
      </section>

      <section className={masterDetailPanel}>
        <TaskEditor
          task={selected}
          onSave={async (patch) => {
            if (!selected) return;
            await updateTask(selected.id, patch);
            await load();
          }}
          onDelete={() => {
            if (selected) {
              setDeleteId(selected.id);
            }
          }}
          onStatusChange={async (status) => {
            if (!selected) return;
            await updateTask(selected.id, { status });
            await load();
          }}
        />
      </section>

      <ConfirmDialog
        open={deleteId !== null}
        title="ลบงานนี้"
        message="งานนี้จะถูกลบอย่างถาวรและกู้กลับไม่ได้"
        confirmLabel="ลบงาน"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void (async () => {
            if (!deleteId) return;
            try {
              await deleteTask(deleteId);
              setDeleteId(null);
              setSelectedId(null);
              await load();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          })();
        }}
      />
    </div>
  );
}
