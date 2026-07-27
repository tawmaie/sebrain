import { useCallback, useEffect, useState } from "react";
import { getDatabase } from "./services/database";
import { usePomodoro } from "./hooks/usePomodoro";
import { deleteTask, getTaskById, updateTask } from "./repositories/taskRepository";
import { LoadingState } from "./components/common/LoadingState";
import { ErrorMessage } from "./components/common/ErrorMessage";
import { TaskDetailWindow } from "./features/today/TaskDetailWindow";
import { onTaskDetailOpen } from "./services/taskDetailEvents";
import { closeCurrentWindow } from "./services/windowService";
import type { Task, TaskStatus } from "./types/task";

type BootState = "loading" | "ready" | "error";

export function TaskDetailApp() {
  const [bootState, setBootState] = useState<BootState>("loading");
  const [bootError, setBootError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const pomodoro = usePomodoro();

  useEffect(() => {
    document.documentElement.classList.add("mini-mode");
    return () => {
      document.documentElement.classList.remove("mini-mode");
    };
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await getDatabase();
        setBootState("ready");
      } catch (err) {
        setBootError(err instanceof Error ? err.message : String(err));
        setBootState("error");
      }
    })();
  }, []);

  const loadTask = useCallback(async (taskId: string) => {
    setLoadingTask(true);
    try {
      const loaded = await getTaskById(taskId);
      setTask(loaded);
    } catch (err) {
      setBootError(err instanceof Error ? err.message : String(err));
      setTask(null);
    } finally {
      setLoadingTask(false);
    }
  }, []);

  useEffect(() => {
    if (bootState !== "ready") {
      return;
    }

    let unlisten: (() => void) | undefined;

    void onTaskDetailOpen((taskId) => {
      void loadTask(taskId);
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => {
      unlisten?.();
    };
  }, [bootState, loadTask]);

  const handleStatusChange = async (
    taskId: string,
    status: Extract<TaskStatus, "today" | "doing" | "done">,
  ) => {
    await updateTask(taskId, { status });

    if (status === "doing") {
      pomodoro.setTaskId(taskId);
    } else if (pomodoro.taskId === taskId) {
      pomodoro.setTaskId(null);
    }

    const refreshed = await getTaskById(taskId);
    setTask(refreshed);

    if (status === "done") {
      await closeCurrentWindow();
    }
  };

  const handleDelete = async (taskId: string) => {
    if (pomodoro.taskId === taskId) {
      pomodoro.setTaskId(null);
    }
    await deleteTask(taskId);
    await closeCurrentWindow();
  };

  if (bootState === "loading" || !pomodoro.ready) {
    return <LoadingState label="กำลังโหลด..." />;
  }

  if (bootState === "error") {
    return <ErrorMessage message={bootError ?? "ไม่สามารถเปิดเคสได้"} />;
  }

  if (loadingTask) {
    return <LoadingState label="กำลังโหลดเคส..." />;
  }

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-text-secondary">
        เลือกเคสจาก Mini Timer เพื่อเปิดรายละเอียด
      </div>
    );
  }

  if (pomodoro.error) {
    return <ErrorMessage message={pomodoro.error} />;
  }

  return (
    <TaskDetailWindow
      task={task}
      pomodoroTaskId={pomodoro.taskId}
      onTaskUpdated={setTask}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
    />
  );
}
