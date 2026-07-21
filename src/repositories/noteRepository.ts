import type { Note, NoteInput } from "../types/note";
import { getDatabase } from "../services/database";

interface NoteRow {
  id: string;
  title: string;
  content_markdown: string;
  is_pinned: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    contentMarkdown: row.content_markdown,
    isPinned: row.is_pinned === 1,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Note title cannot be empty");
  }
  return trimmed;
}

export async function listNotes(options?: {
  includeArchived?: boolean;
}): Promise<Note[]> {
  const db = await getDatabase();
  const includeArchived = options?.includeArchived ?? false;

  const rows = includeArchived
    ? await db.select<NoteRow[]>(
        `SELECT id, title, content_markdown, is_pinned, is_archived, created_at, updated_at
         FROM notes
         ORDER BY is_pinned DESC, updated_at DESC`,
      )
    : await db.select<NoteRow[]>(
        `SELECT id, title, content_markdown, is_pinned, is_archived, created_at, updated_at
         FROM notes
         WHERE is_archived = 0
         ORDER BY is_pinned DESC, updated_at DESC`,
      );

  return rows.map(mapRow);
}

export async function getNoteById(id: string): Promise<Note | null> {
  const db = await getDatabase();
  const rows = await db.select<NoteRow[]>(
    `SELECT id, title, content_markdown, is_pinned, is_archived, created_at, updated_at
     FROM notes WHERE id = $1`,
    [id],
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function createNote(input: NoteInput): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    title: validateTitle(input.title),
    contentMarkdown: input.contentMarkdown ?? "",
    isPinned: input.isPinned ?? false,
    isArchived: input.isArchived ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO notes (
      id, title, content_markdown, is_pinned, is_archived, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      note.id,
      note.title,
      note.contentMarkdown,
      note.isPinned ? 1 : 0,
      note.isArchived ? 1 : 0,
      note.createdAt,
      note.updatedAt,
    ],
  );

  return note;
}

export async function updateNote(
  id: string,
  patch: Partial<NoteInput>,
): Promise<Note> {
  const existing = await getNoteById(id);
  if (!existing) {
    throw new Error("Note not found");
  }

  const updated: Note = {
    ...existing,
    title:
      patch.title !== undefined
        ? validateTitle(patch.title)
        : existing.title,
    contentMarkdown:
      patch.contentMarkdown !== undefined
        ? patch.contentMarkdown
        : existing.contentMarkdown,
    isPinned:
      patch.isPinned !== undefined ? patch.isPinned : existing.isPinned,
    isArchived:
      patch.isArchived !== undefined ? patch.isArchived : existing.isArchived,
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.execute(
    `UPDATE notes SET
      title = $1,
      content_markdown = $2,
      is_pinned = $3,
      is_archived = $4,
      updated_at = $5
     WHERE id = $6`,
    [
      updated.title,
      updated.contentMarkdown,
      updated.isPinned ? 1 : 0,
      updated.isArchived ? 1 : 0,
      updated.updatedAt,
      updated.id,
    ],
  );

  return updated;
}

export async function deleteNote(id: string): Promise<void> {
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
