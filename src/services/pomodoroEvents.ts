import { emit, listen } from "@tauri-apps/api/event";

export const POMODORO_CHANGED_EVENT = "pomodoro-changed";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function emitPomodoroChanged(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await emit(POMODORO_CHANGED_EVENT);
}

export async function onPomodoroChanged(
  handler: () => void,
): Promise<() => void> {
  if (!isTauri()) {
    return () => undefined;
  }

  return listen(POMODORO_CHANGED_EVENT, handler);
}
