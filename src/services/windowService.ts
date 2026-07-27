import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { emitTaskDetailOpen } from "./taskDetailEvents";

export const MAIN_WINDOW_LABEL = "main";
export const MINI_WINDOW_LABEL = "mini";
export const WORK_LOG_WINDOW_LABEL = "work-log";
export const TASK_DETAIL_WINDOW_LABEL = "task-detail";
export const MINI_WINDOW_SIZE = { width: 300, height: 300 };

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function isTauriApp(): boolean {
  return isTauri();
}

async function getWindow(label: string): Promise<WebviewWindow | null> {
  return WebviewWindow.getByLabel(label);
}

async function prepareMiniWindow(mini: WebviewWindow): Promise<void> {
  await mini.setSize(
    new LogicalSize(MINI_WINDOW_SIZE.width, MINI_WINDOW_SIZE.height),
  );
  await mini.setAlwaysOnTop(true);
}

export async function hideMainWindow(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const main = await getWindow(MAIN_WINDOW_LABEL);
  if (main) {
    await main.hide();
  }
}

export async function showMainWindow(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const main = await getWindow(MAIN_WINDOW_LABEL);
  if (main) {
    await main.show();
    await main.unminimize();
    await main.setFocus();
  }
}

async function hideSecondaryWindows(): Promise<void> {
  const workLog = await getWindow(WORK_LOG_WINDOW_LABEL);
  if (workLog) {
    await workLog.hide();
  }

  const taskDetail = await getWindow(TASK_DETAIL_WINDOW_LABEL);
  if (taskDetail) {
    await taskDetail.hide();
  }
}

export async function enterMiniMode(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const mini = await getWindow(MINI_WINDOW_LABEL);
  if (!mini) {
    return;
  }

  await prepareMiniWindow(mini);
  await mini.show();
  await mini.setFocus();
  await hideMainWindow();
}

export async function exitMiniMode(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const mini = await getWindow(MINI_WINDOW_LABEL);
  if (mini) {
    await mini.hide();
  }

  await hideSecondaryWindows();
  await showMainWindow();
}

export async function openMiniWindow(): Promise<void> {
  await enterMiniMode();
}

export async function closeMiniWindow(): Promise<void> {
  await exitMiniMode();
}

export async function toggleMiniWindow(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const mini = await getWindow(MINI_WINDOW_LABEL);
  if (!mini) {
    return;
  }

  const visible = await mini.isVisible();
  if (visible) {
    await exitMiniMode();
  } else {
    await enterMiniMode();
  }
}

export async function isMiniWindowVisible(): Promise<boolean> {
  if (!isTauri()) {
    return false;
  }

  const mini = await getWindow(MINI_WINDOW_LABEL);
  if (!mini) {
    return false;
  }

  return mini.isVisible();
}

export async function openWorkLogWindow(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const workLog = await getWindow(WORK_LOG_WINDOW_LABEL);
  if (!workLog) {
    return;
  }

  await workLog.show();
  await workLog.setFocus();
}

export async function openTaskDetailWindow(taskId: string): Promise<void> {
  if (!isTauri()) {
    return;
  }

  const taskDetail = await getWindow(TASK_DETAIL_WINDOW_LABEL);
  if (!taskDetail) {
    return;
  }

  await emitTaskDetailOpen(taskId);
  await taskDetail.show();
  await taskDetail.setFocus();
}

export async function restoreMainFromMini(): Promise<void> {
  await exitMiniMode();
}

export async function closeCurrentWindow(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await getCurrentWindow().hide();
}

export async function startWindowDrag(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  await getCurrentWindow().startDragging();
}
