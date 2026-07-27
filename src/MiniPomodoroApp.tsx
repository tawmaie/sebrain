import { useEffect, useState } from "react";
import { getDatabase } from "./services/database";
import { usePomodoro } from "./hooks/usePomodoro";
import { loadFocusTasks } from "./features/focus/focusTaskUtils";
import { LoadingState } from "./components/common/LoadingState";
import { ErrorMessage } from "./components/common/ErrorMessage";
import { MiniPomodoroWindow } from "./features/focus/MiniPomodoroWindow";
import type { Task } from "./types/task";
import type { SessionType } from "./types/pomodoro";

type BootState = "loading" | "ready" | "error";

export function MiniPomodoroApp() {
  const [bootState, setBootState] = useState<BootState>("loading");
  const [bootError, setBootError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
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
    void (async () => {
      setLoadingTasks(true);
      try {
        setTasks(await loadFocusTasks());
      } catch {
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    })();
  }, [pomodoro.lastCompletedAt]);

  const taskLabel =
    tasks.find((task) => task.id === pomodoro.taskId)?.title ?? null;

  if (bootState === "loading") {
    return <LoadingState label="กำลังโหลด..." />;
  }

  if (bootState === "error") {
    return <ErrorMessage message={bootError ?? "ไม่สามารถเริ่ม Mini Timer ได้"} />;
  }

  if (!pomodoro.ready) {
    return <LoadingState label="กำลังกู้สถานะ Timer..." />;
  }

  if (pomodoro.error) {
    return <ErrorMessage message={pomodoro.error} />;
  }

  return (
    <MiniPomodoroWindow
      remainingSeconds={pomodoro.remainingSeconds}
      overtimeSeconds={pomodoro.overtimeSeconds}
      durationSeconds={pomodoro.durationSeconds}
      sessionType={pomodoro.sessionType}
      status={pomodoro.status}
      taskId={pomodoro.taskId}
      taskLabel={taskLabel}
      tasks={tasks}
      loadingTasks={loadingTasks}
      onSessionTypeChange={(type: SessionType) => pomodoro.applySessionType(type)}
      onTaskIdChange={(taskId) => pomodoro.setTaskId(taskId)}
      onStart={() => void pomodoro.start()}
      onPause={() => void pomodoro.pause()}
      onResume={() => void pomodoro.resume()}
      onReset={() => void pomodoro.reset()}
      onFinishEarly={() => void pomodoro.finishEarly()}
    />
  );
}
