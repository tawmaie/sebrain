import type Database from "@tauri-apps/plugin-sql";

interface Migration {
  version: number;
  sql: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inbox_items (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content_markdown TEXT NOT NULL DEFAULT '',
        is_pinned INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'inbox',
        planned_date TEXT,
        estimated_pomodoros INTEGER NOT NULL DEFAULT 1,
        completed_pomodoros INTEGER NOT NULL DEFAULT 0,
        linked_note_id TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (linked_note_id) REFERENCES notes(id)
      );

      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        note_id TEXT,
        session_type TEXT NOT NULL,
        status TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (note_id) REFERENCES notes(id)
      );

      CREATE TABLE IF NOT EXISTS active_timer (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        note_id TEXT,
        session_type TEXT NOT NULL,
        status TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        remaining_seconds INTEGER,
        started_at TEXT NOT NULL,
        end_at TEXT,
        paused_at TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (note_id) REFERENCES notes(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_inbox_created_at
        ON inbox_items(created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_tasks_status
        ON tasks(status);

      CREATE INDEX IF NOT EXISTS idx_tasks_planned_date
        ON tasks(planned_date);

      CREATE INDEX IF NOT EXISTS idx_notes_updated_at
        ON notes(updated_at DESC);

      CREATE INDEX IF NOT EXISTS idx_pomodoro_started_at
        ON pomodoro_sessions(started_at DESC);
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE notes ADD COLUMN type TEXT NOT NULL DEFAULT 'note';
      ALTER TABLE notes ADD COLUMN task_id TEXT;

      UPDATE notes
      SET type = 'task_progress',
          task_id = (
            SELECT tasks.id
            FROM tasks
            WHERE tasks.linked_note_id = notes.id
            LIMIT 1
          )
      WHERE id IN (
        SELECT linked_note_id FROM tasks WHERE linked_note_id IS NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(type);
      CREATE INDEX IF NOT EXISTS idx_notes_task_id ON notes(task_id);
    `,
  },
];

export async function runMigrations(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = await db.select<{ version: number }[]>(
    "SELECT version FROM schema_migrations ORDER BY version ASC",
  );
  const appliedVersions = new Set(applied.map((row) => row.version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    await db.execute("BEGIN");
    try {
      const statements = migration.sql
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }

      await db.execute(
        "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2)",
        [migration.version, new Date().toISOString()],
      );
      await db.execute("COMMIT");
    } catch (error) {
      await db.execute("ROLLBACK");
      throw error;
    }
  }
}
