export type SessionType = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused" | "overtime";
export type SessionStatus = "running" | "completed" | "cancelled";

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  noteId: string | null;
  sessionType: SessionType;
  status: SessionStatus;
  durationSeconds: number;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
}

export interface ActiveTimer {
  id: string;
  taskId: string | null;
  noteId: string | null;
  sessionType: SessionType;
  status: Exclude<TimerStatus, "idle">;
  durationSeconds: number;
  remainingSeconds: number | null;
  overtimeSeconds: number;
  startedAt: string;
  endAt: string | null;
  pausedAt: string | null;
  updatedAt: string;
}

export const ACTIVE_TIMER_ID = "current";
