import type Database from "@tauri-apps/plugin-sql";
import type { InboxItem } from "../types/inbox";
import { getDatabase } from "../services/database";
import { createTask } from "./taskRepository";
import { createNote } from "./noteRepository";

interface InboxRow {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: InboxRow): InboxItem {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listInboxItems(): Promise<InboxItem[]> {
  const db = await getDatabase();
  const rows = await db.select<InboxRow[]>(
    "SELECT id, content, created_at, updated_at FROM inbox_items ORDER BY created_at DESC",
  );
  return rows.map(mapRow);
}

export async function createInboxItem(content: string): Promise<InboxItem> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Content cannot be empty");
  }

  const now = new Date().toISOString();
  const item: InboxItem = {
    id: crypto.randomUUID(),
    content: trimmed,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    "INSERT INTO inbox_items (id, content, created_at, updated_at) VALUES ($1, $2, $3, $4)",
    [item.id, item.content, item.createdAt, item.updatedAt],
  );

  return item;
}

export async function updateInboxItem(
  id: string,
  content: string,
): Promise<InboxItem> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Content cannot be empty");
  }

  const updatedAt = new Date().toISOString();
  const db = await getDatabase();
  await db.execute(
    "UPDATE inbox_items SET content = $1, updated_at = $2 WHERE id = $3",
    [trimmed, updatedAt, id],
  );

  const rows = await db.select<InboxRow[]>(
    "SELECT id, content, created_at, updated_at FROM inbox_items WHERE id = $1",
    [id],
  );

  if (rows.length === 0) {
    throw new Error("Inbox item not found");
  }

  return mapRow(rows[0]);
}

export async function deleteInboxItem(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM inbox_items WHERE id = $1", [id]);
}

export async function convertInboxToTask(id: string): Promise<void> {
  const db = await getDatabase();
  const item = await getInboxItemOrThrow(db, id);
  await createTask({ title: item.content, status: "inbox" });
  await db.execute("DELETE FROM inbox_items WHERE id = $1", [id]);
}

export async function convertInboxToNote(id: string): Promise<void> {
  const db = await getDatabase();
  const item = await getInboxItemOrThrow(db, id);
  await createNote({
    title: item.content.slice(0, 80) || "Untitled note",
    contentMarkdown: item.content,
  });
  await db.execute("DELETE FROM inbox_items WHERE id = $1", [id]);
}

async function getInboxItemOrThrow(
  db: Database,
  id: string,
): Promise<InboxItem> {
  const rows = await db.select<InboxRow[]>(
    "SELECT id, content, created_at, updated_at FROM inbox_items WHERE id = $1",
    [id],
  );

  if (rows.length === 0) {
    throw new Error("Inbox item not found");
  }

  return mapRow(rows[0]);
}
