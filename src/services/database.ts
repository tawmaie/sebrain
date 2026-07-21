import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "./migrations";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
} from "../types/settings";

let database: Database | null = null;
let initPromise: Promise<Database> | null = null;

export async function getDatabase(): Promise<Database> {
  if (database) {
    return database;
  }

  if (!initPromise) {
    initPromise = initializeDatabase();
  }

  return initPromise;
}

async function seedDefaultSettings(db: Database): Promise<void> {
  const rows = await db.select<{ key: string }[]>(
    "SELECT key FROM settings WHERE key = $1",
    [SETTINGS_KEY],
  );

  if (rows.length > 0) {
    return;
  }

  await db.execute(
    "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)",
    [SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS), new Date().toISOString()],
  );
}

async function initializeDatabase(): Promise<Database> {
  const db = await Database.load("sqlite:sebrain.db");
  await db.execute("PRAGMA foreign_keys = ON");
  await runMigrations(db);
  await seedDefaultSettings(db);
  database = db;
  return db;
}

export function resetDatabaseConnection(): void {
  database = null;
  initPromise = null;
}
