import type {
  ActiveTimer,
  PomodoroSession,
  SessionStatus,
  SessionType,
} from "../types/pomodoro";
import { ACTIVE_TIMER_ID } from "../types/pomodoro";
import { getDatabase } from "../services/database";

interface SessionRow {
  id: string;
  task_id: string | null;
  note_id: string | null;
  session_type: SessionType;
  status: SessionStatus;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

interface ActiveTimerRow {
  id: string;
  task_id: string | null;
  note_id: string | null;
  session_type: SessionType;
  status: "running" | "paused" | "overtime";
  duration_seconds: number;
  remaining_seconds: number | null;
  overtime_seconds: number;
  started_at: string;
  end_at: string | null;
  paused_at: string | null;
  updated_at: string;
}

function mapSession(row: SessionRow): PomodoroSession {
  return {
    id: row.id,
    taskId: row.task_id,
    noteId: row.note_id,
    sessionType: row.session_type,
    status: row.status,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
  };
}

function mapActiveTimer(row: ActiveTimerRow): ActiveTimer {
  return {
    id: row.id,
    taskId: row.task_id,
    noteId: row.note_id,
    sessionType: row.session_type,
    status: row.status,
    durationSeconds: row.duration_seconds,
    remainingSeconds: row.remaining_seconds,
    overtimeSeconds: row.overtime_seconds ?? 0,
    startedAt: row.started_at,
    endAt: row.end_at,
    pausedAt: row.paused_at,
    updatedAt: row.updated_at,
  };
}

export async function listRecentSessions(
  limit = 10,
): Promise<PomodoroSession[]> {
  const db = await getDatabase();
  const rows = await db.select<SessionRow[]>(
    `SELECT id, task_id, note_id, session_type, status, duration_seconds,
            started_at, ended_at, created_at
     FROM pomodoro_sessions
     ORDER BY started_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows.map(mapSession);
}

export async function createSession(input: {
  taskId: string | null;
  noteId: string | null;
  sessionType: SessionType;
  status: SessionStatus;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string | null;
}): Promise<PomodoroSession> {
  const now = new Date().toISOString();
  const session: PomodoroSession = {
    id: crypto.randomUUID(),
    taskId: input.taskId,
    noteId: input.noteId,
    sessionType: input.sessionType,
    status: input.status,
    durationSeconds: input.durationSeconds,
    startedAt: input.startedAt,
    endedAt: input.endedAt ?? null,
    createdAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO pomodoro_sessions (
      id, task_id, note_id, session_type, status, duration_seconds,
      started_at, ended_at, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      session.id,
      session.taskId,
      session.noteId,
      session.sessionType,
      session.status,
      session.durationSeconds,
      session.startedAt,
      session.endedAt,
      session.createdAt,
    ],
  );

  return session;
}

export async function updateSessionStatus(
  id: string,
  status: SessionStatus,
  endedAt: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE pomodoro_sessions SET status = $1, ended_at = $2 WHERE id = $3",
    [status, endedAt, id],
  );
}

export async function updateSessionCompletion(
  id: string,
  endedAt: string,
  durationSeconds: number,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE pomodoro_sessions
     SET status = 'completed', ended_at = $1, duration_seconds = $2
     WHERE id = $3`,
    [endedAt, durationSeconds, id],
  );
}

export async function getActiveTimer(): Promise<ActiveTimer | null> {
  const db = await getDatabase();
  const rows = await db.select<ActiveTimerRow[]>(
    `SELECT id, task_id, note_id, session_type, status, duration_seconds,
            remaining_seconds, overtime_seconds, started_at, end_at, paused_at, updated_at
     FROM active_timer WHERE id = $1`,
    [ACTIVE_TIMER_ID],
  );
  return rows.length > 0 ? mapActiveTimer(rows[0]) : null;
}

export async function upsertActiveTimer(
  timer: Omit<ActiveTimer, "id">,
): Promise<ActiveTimer> {
  const db = await getDatabase();
  const record: ActiveTimer = { ...timer, id: ACTIVE_TIMER_ID };

  await db.execute(
    `INSERT INTO active_timer (
      id, task_id, note_id, session_type, status, duration_seconds,
      remaining_seconds, overtime_seconds, started_at, end_at, paused_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT(id) DO UPDATE SET
      task_id = excluded.task_id,
      note_id = excluded.note_id,
      session_type = excluded.session_type,
      status = excluded.status,
      duration_seconds = excluded.duration_seconds,
      remaining_seconds = excluded.remaining_seconds,
      overtime_seconds = excluded.overtime_seconds,
      started_at = excluded.started_at,
      end_at = excluded.end_at,
      paused_at = excluded.paused_at,
      updated_at = excluded.updated_at`,
    [
      record.id,
      record.taskId,
      record.noteId,
      record.sessionType,
      record.status,
      record.durationSeconds,
      record.remainingSeconds,
      record.overtimeSeconds,
      record.startedAt,
      record.endAt,
      record.pausedAt,
      record.updatedAt,
    ],
  );

  return record;
}

export async function clearActiveTimer(): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM active_timer WHERE id = $1", [ACTIVE_TIMER_ID]);
}

export async function getFocusMinutesToday(): Promise<number> {
  const db = await getDatabase();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const rows = await db.select<{ total: number }[]>(
    `SELECT COALESCE(SUM(duration_seconds), 0) AS total
     FROM pomodoro_sessions
     WHERE session_type = 'focus'
       AND status = 'completed'
       AND started_at >= $1
       AND started_at <= $2`,
    [start.toISOString(), end.toISOString()],
  );

  return Math.floor((rows[0]?.total ?? 0) / 60);
}

export async function findRunningSessionForTimer(params: {
  taskId: string | null;
  noteId: string | null;
  sessionType: SessionType;
  startedAt: string;
}): Promise<PomodoroSession | null> {
  const db = await getDatabase();
  const rows = await db.select<SessionRow[]>(
    `SELECT id, task_id, note_id, session_type, status, duration_seconds,
            started_at, ended_at, created_at
     FROM pomodoro_sessions
     WHERE status = 'running'
       AND session_type = $1
       AND started_at = $2
       AND (($3 IS NULL AND task_id IS NULL) OR task_id = $3)
       AND (($4 IS NULL AND note_id IS NULL) OR note_id = $4)
     ORDER BY created_at DESC
     LIMIT 1`,
    [params.sessionType, params.startedAt, params.taskId, params.noteId],
  );
  return rows.length > 0 ? mapSession(rows[0]) : null;
}
