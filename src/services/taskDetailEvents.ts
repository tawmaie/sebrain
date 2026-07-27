import { emit, listen } from "@tauri-apps/api/event";

export const TASK_DETAIL_OPEN_EVENT = "task-detail-open";

export interface TaskDetailOpenPayload {
  taskId: string;
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function emitTaskDetailOpen(taskId: string): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await emit<TaskDetailOpenPayload>(TASK_DETAIL_OPEN_EVENT, { taskId });
}

export async function onTaskDetailOpen(
  handler: (taskId: string) => void,
): Promise<() => void> {
  if (!isTauri()) {
    return () => undefined;
  }

  return listen<TaskDetailOpenPayload>(TASK_DETAIL_OPEN_EVENT, (event) => {
    if (event.payload.taskId) {
      handler(event.payload.taskId);
    }
  });
}
