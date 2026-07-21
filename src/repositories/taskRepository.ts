import type { Task, TaskInput, TaskStatus } from "../types/task";
import { getDatabase } from "../services/database";

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  planned_date: string | null;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  linked_note_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    plannedDate: row.planned_date,
    estimatedPomodoros: row.estimated_pomodoros,
    completedPomodoros: row.completed_pomodoros,
    linkedNoteId: row.linked_note_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Task title cannot be empty");
  }
  return trimmed;
}

function validateEstimated(value: number | undefined): number {
  const estimated = value ?? 1;
  if (!Number.isFinite(estimated) || estimated < 1) {
    throw new Error("estimatedPomodoros must be at least 1");
  }
  return Math.floor(estimated);
}

export async function listTasks(status?: TaskStatus): Promise<Task[]> {
  const db = await getDatabase();

  if (status) {
    const rows = await db.select<TaskRow[]>(
      `SELECT id, title, description, status, planned_date, estimated_pomodoros,
              completed_pomodoros, linked_note_id, completed_at, created_at, updated_at
       FROM tasks WHERE status = $1 ORDER BY updated_at DESC`,
      [status],
    );
    return rows.map(mapRow);
  }

  const rows = await db.select<TaskRow[]>(
    `SELECT id, title, description, status, planned_date, estimated_pomodoros,
            completed_pomodoros, linked_note_id, completed_at, created_at, updated_at
     FROM tasks ORDER BY updated_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = await getDatabase();
  const rows = await db.select<TaskRow[]>(
    `SELECT id, title, description, status, planned_date, estimated_pomodoros,
            completed_pomodoros, linked_note_id, completed_at, created_at, updated_at
     FROM tasks WHERE id = $1`,
    [id],
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const now = new Date().toISOString();
  const status = input.status ?? "inbox";
  const task: Task = {
    id: crypto.randomUUID(),
    title: validateTitle(input.title),
    description: input.description?.trim() ?? "",
    status,
    plannedDate:
      input.plannedDate ??
      (status === "today" ? now.slice(0, 10) : null),
    estimatedPomodoros: validateEstimated(input.estimatedPomodoros),
    completedPomodoros: 0,
    linkedNoteId: input.linkedNoteId ?? null,
    completedAt: status === "done" ? now : null,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO tasks (
      id, title, description, status, planned_date, estimated_pomodoros,
      completed_pomodoros, linked_note_id, completed_at, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      task.id,
      task.title,
      task.description,
      task.status,
      task.plannedDate,
      task.estimatedPomodoros,
      task.completedPomodoros,
      task.linkedNoteId,
      task.completedAt,
      task.createdAt,
      task.updatedAt,
    ],
  );

  return task;
}

export async function updateTask(
  id: string,
  patch: Partial<TaskInput> & {
    completedPomodoros?: number;
    completedAt?: string | null;
  },
): Promise<Task> {
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error("Task not found");
  }

  const nextStatus = patch.status ?? existing.status;
  const now = new Date().toISOString();

  let completedAt = existing.completedAt;
  if (nextStatus === "done" && existing.status !== "done") {
    completedAt = now;
  } else if (nextStatus !== "done") {
    completedAt = null;
  }
  if (patch.completedAt !== undefined) {
    completedAt = patch.completedAt;
  }

  let plannedDate =
    patch.plannedDate !== undefined ? patch.plannedDate : existing.plannedDate;
  if (nextStatus === "today" && !plannedDate) {
    plannedDate = now.slice(0, 10);
  }

  const updated: Task = {
    ...existing,
    title:
      patch.title !== undefined
        ? validateTitle(patch.title)
        : existing.title,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : existing.description,
    status: nextStatus,
    plannedDate,
    estimatedPomodoros:
      patch.estimatedPomodoros !== undefined
        ? validateEstimated(patch.estimatedPomodoros)
        : existing.estimatedPomodoros,
    completedPomodoros:
      patch.completedPomodoros !== undefined
        ? Math.max(0, Math.floor(patch.completedPomodoros))
        : existing.completedPomodoros,
    linkedNoteId:
      patch.linkedNoteId !== undefined
        ? patch.linkedNoteId
        : existing.linkedNoteId,
    completedAt,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    `UPDATE tasks SET
      title = $1,
      description = $2,
      status = $3,
      planned_date = $4,
      estimated_pomodoros = $5,
      completed_pomodoros = $6,
      linked_note_id = $7,
      completed_at = $8,
      updated_at = $9
     WHERE id = $10`,
    [
      updated.title,
      updated.description,
      updated.status,
      updated.plannedDate,
      updated.estimatedPomodoros,
      updated.completedPomodoros,
      updated.linkedNoteId,
      updated.completedAt,
      updated.updatedAt,
      updated.id,
    ],
  );

  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE pomodoro_sessions SET task_id = NULL WHERE task_id = $1",
    [id],
  );
  await db.execute("UPDATE active_timer SET task_id = NULL WHERE task_id = $1", [
    id,
  ]);
  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function incrementCompletedPomodoros(id: string): Promise<Task> {
  const task = await getTaskById(id);
  if (!task) {
    throw new Error("Task not found");
  }
  return updateTask(id, {
    completedPomodoros: task.completedPomodoros + 1,
  });
}

export async function countFocusSessionsToday(): Promise<number> {
  const db = await getDatabase();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const rows = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM pomodoro_sessions
     WHERE session_type = 'focus'
       AND status = 'completed'
       AND started_at >= $1
       AND started_at <= $2`,
    [start.toISOString(), end.toISOString()],
  );

  return rows[0]?.count ?? 0;
}

export async function getTodayTaskStats(): Promise<{
  done: number;
  total: number;
}> {
  const db = await getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const rows = await db.select<{ done: number; total: number }[]>(
    `SELECT
       COUNT(CASE WHEN status = 'done' AND date(completed_at) = $1 THEN 1 END) AS done,
       COUNT(*) AS total
     FROM tasks
     WHERE planned_date = $1
        OR (status = 'done' AND date(completed_at) = $1)`,
    [today],
  );

  return rows[0] ?? { done: 0, total: 0 };
}
