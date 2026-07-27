import { useEffect, useState } from "react";
import { LoadingState } from "./components/common/LoadingState";
import { ErrorMessage } from "./components/common/ErrorMessage";
import { WorkLogWindow } from "./features/log/WorkLogWindow";
import { usePomodoro } from "./hooks/usePomodoro";
import { createTaskLogEntry } from "./repositories/taskLogRepository";
import { listTasks } from "./repositories/taskRepository";
import { getDatabase } from "./services/database";
import { closeCurrentWindow } from "./services/windowService";

type BootState = "loading" | "ready" | "error";

export function WorkLogApp() {
  const [bootState, setBootState] = useState<BootState>("loading");
  const [bootError, setBootError] = useState<string | null>(null);
  const [taskLabel, setTaskLabel] = useState<string | null>(null);
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

  useEffect(() => {
    if (!pomodoro.taskId) {
      setTaskLabel(null);
      return;
    }

    void listTasks()
      .then((tasks) => {
        setTaskLabel(
          tasks.find((task) => task.id === pomodoro.taskId)?.title ?? null,
        );
      })
      .catch(() => setTaskLabel(null));
  }, [pomodoro.taskId]);

  if (bootState === "loading" || !pomodoro.ready) {
    return <LoadingState label="กำลังโหลด..." />;
  }

  if (bootState === "error") {
    return <ErrorMessage message={bootError ?? "ไม่สามารถเปิดบันทึก log ได้"} />;
  }

  if (pomodoro.error) {
    return <ErrorMessage message={pomodoro.error} />;
  }

  return (
    <WorkLogWindow
      taskId={pomodoro.taskId}
      taskLabel={taskLabel}
      onSubmit={async (body) => {
        if (!pomodoro.taskId) {
          return;
        }
        await createTaskLogEntry({ taskId: pomodoro.taskId, body });
        await closeCurrentWindow();
      }}
    />
  );
}
