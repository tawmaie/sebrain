import type {
  TaskLogEntry,
  TaskLogEntryWithTask,
  TaskLogInput,
} from "../types/taskLog";
import { getDatabase } from "../services/database";

interface TaskLogRow {
  id: string;
  task_id: string;
  body: string;
  created_at: string;
}

interface TaskLogWithTaskRow extends TaskLogRow {
  task_title: string;
}

function mapRow(row: TaskLogRow): TaskLogEntry {
  return {
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapRowWithTask(row: TaskLogWithTaskRow): TaskLogEntryWithTask {
  return {
    ...mapRow(row),
    taskTitle: row.task_title,
  };
}

function validateBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Log body cannot be empty");
  }
  return trimmed;
}

export async function createTaskLogEntry(
  input: TaskLogInput,
): Promise<TaskLogEntry> {
  const db = await getDatabase();
  const body = validateBody(input.body);
  const now = new Date().toISOString();
  const entry: TaskLogEntry = {
    id: crypto.randomUUID(),
    taskId: input.taskId,
    body,
    createdAt: now,
  };

  await db.execute(
    `INSERT INTO task_log_entries (id, task_id, body, created_at)
     VALUES ($1, $2, $3, $4)`,
    [entry.id, entry.taskId, entry.body, entry.createdAt],
  );

  return entry;
}

export async function listTaskLogEntries(
  taskId: string,
  limit = 100,
): Promise<TaskLogEntry[]> {
  const db = await getDatabase();
  const rows = await db.select<TaskLogRow[]>(
    `SELECT id, task_id, body, created_at
     FROM task_log_entries
     WHERE task_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [taskId, limit],
  );

  return rows.map(mapRow);
}

export async function listRecentTaskLogEntries(options?: {
  taskId?: string;
  limit?: number;
}): Promise<TaskLogEntryWithTask[]> {
  const db = await getDatabase();
  const limit = options?.limit ?? 100;
  const params: Array<string | number> = [];
  let whereClause = "";

  if (options?.taskId) {
    whereClause = "WHERE l.task_id = $1";
    params.push(options.taskId);
  }

  params.push(limit);
  const limitParam = `$${params.length}`;

  const rows = await db.select<TaskLogWithTaskRow[]>(
    `SELECT l.id, l.task_id, l.body, l.created_at, t.title AS task_title
     FROM task_log_entries l
     INNER JOIN tasks t ON t.id = l.task_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT ${limitParam}`,
    params,
  );

  return rows.map(mapRowWithTask);
}

export async function deleteTaskLogEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM task_log_entries WHERE id = $1", [id]);
}

export async function searchTaskLogEntries(
  query: string,
  limit = 50,
): Promise<TaskLogEntryWithTask[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const entries = await listRecentTaskLogEntries({ limit: 500 });
  return entries
    .filter(
      (entry) =>
        entry.body.toLowerCase().includes(normalized) ||
        entry.taskTitle.toLowerCase().includes(normalized),
    )
    .slice(0, limit);
}
