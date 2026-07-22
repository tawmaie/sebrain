import type { Entry, EntryInput } from "../types/entry";
import {
  createEntry,
  deleteEntry,
  getEntryById,
  listEntries,
  updateEntry,
} from "./entryRepository";

export async function listNotes(options?: {
  includeArchived?: boolean;
}): Promise<Entry[]> {
  return listEntries({ ...options, type: "note" });
}

export async function getNoteById(id: string): Promise<Entry | null> {
  return getEntryById(id);
}

export async function createNote(input: EntryInput): Promise<Entry> {
  return createEntry({ ...input, type: "note" });
}

export async function updateNote(
  id: string,
  patch: Partial<EntryInput>,
): Promise<Entry> {
  return updateEntry(id, patch);
}

export async function deleteNote(id: string): Promise<void> {
  return deleteEntry(id);
}
