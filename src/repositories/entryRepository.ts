import type { Entry, EntryInput, EntryType } from "../types/entry";
import { getDatabase } from "../services/database";

interface EntryRow {
  id: string;
  type: string;
  title: string;
  content_markdown: string;
  task_id: string | null;
  is_pinned: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

const ENTRY_SELECT = `id, type, title, content_markdown, task_id, is_pinned, is_archived, created_at, updated_at`;

function mapRow(row: EntryRow): Entry {
  return {
    id: row.id,
    type: row.type as EntryType,
    title: row.title,
    contentMarkdown: row.content_markdown,
    taskId: row.task_id,
    isPinned: row.is_pinned === 1,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Entry title cannot be empty");
  }
  return trimmed;
}

function validateType(type: EntryType | undefined): EntryType {
  return type ?? "note";
}

export async function listEntries(options?: {
  type?: EntryType;
  taskId?: string;
  includeArchived?: boolean;
}): Promise<Entry[]> {
  const db = await getDatabase();
  const includeArchived = options?.includeArchived ?? false;
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (!includeArchived) {
    conditions.push("is_archived = 0");
  }

  if (options?.type) {
    params.push(options.type);
    conditions.push(`type = $${params.length}`);
  }

  if (options?.taskId) {
    params.push(options.taskId);
    conditions.push(`task_id = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await db.select<EntryRow[]>(
    `SELECT ${ENTRY_SELECT}
     FROM notes
     ${whereClause}
     ORDER BY is_pinned DESC, updated_at DESC`,
    params,
  );

  return rows.map(mapRow);
}

export async function getEntryById(id: string): Promise<Entry | null> {
  const db = await getDatabase();
  const rows = await db.select<EntryRow[]>(
    `SELECT ${ENTRY_SELECT} FROM notes WHERE id = $1`,
    [id],
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function getTaskProgressEntry(
  taskId: string,
): Promise<Entry | null> {
  const db = await getDatabase();
  const rows = await db.select<EntryRow[]>(
    `SELECT ${ENTRY_SELECT}
     FROM notes
     WHERE task_id = $1 AND type = 'task_progress'
     ORDER BY updated_at DESC
     LIMIT 1`,
    [taskId],
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function createEntry(input: EntryInput): Promise<Entry> {
  const now = new Date().toISOString();
  const entry: Entry = {
    id: crypto.randomUUID(),
    type: validateType(input.type),
    title: validateTitle(input.title),
    contentMarkdown: input.contentMarkdown ?? "",
    taskId: input.taskId ?? null,
    isPinned: input.isPinned ?? false,
    isArchived: input.isArchived ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO notes (
      id, type, title, content_markdown, task_id, is_pinned, is_archived, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      entry.id,
      entry.type,
      entry.title,
      entry.contentMarkdown,
      entry.taskId,
      entry.isPinned ? 1 : 0,
      entry.isArchived ? 1 : 0,
      entry.createdAt,
      entry.updatedAt,
    ],
  );

  return entry;
}

export async function updateEntry(
  id: string,
  patch: Partial<EntryInput>,
): Promise<Entry> {
  const existing = await getEntryById(id);
  if (!existing) {
    throw new Error("Entry not found");
  }

  const updated: Entry = {
    ...existing,
    type: patch.type !== undefined ? validateType(patch.type) : existing.type,
    title:
      patch.title !== undefined
        ? validateTitle(patch.title)
        : existing.title,
    contentMarkdown:
      patch.contentMarkdown !== undefined
        ? patch.contentMarkdown
        : existing.contentMarkdown,
    taskId: patch.taskId !== undefined ? patch.taskId : existing.taskId,
    isPinned:
      patch.isPinned !== undefined ? patch.isPinned : existing.isPinned,
    isArchived:
      patch.isArchived !== undefined ? patch.isArchived : existing.isArchived,
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.execute(
    `UPDATE notes SET
      type = $1,
      title = $2,
      content_markdown = $3,
      task_id = $4,
      is_pinned = $5,
      is_archived = $6,
      updated_at = $7
     WHERE id = $8`,
    [
      updated.type,
      updated.title,
      updated.contentMarkdown,
      updated.taskId,
      updated.isPinned ? 1 : 0,
      updated.isArchived ? 1 : 0,
      updated.updatedAt,
      updated.id,
    ],
  );

  return updated;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE tasks SET linked_note_id = NULL WHERE linked_note_id = $1",
    [id],
  );
  await db.execute(
    "UPDATE pomodoro_sessions SET note_id = NULL WHERE note_id = $1",
    [id],
  );
  await db.execute("UPDATE active_timer SET note_id = NULL WHERE note_id = $1", [
    id,
  ]);
  await db.execute("DELETE FROM notes WHERE id = $1", [id]);
}
