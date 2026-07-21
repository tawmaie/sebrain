import type { AppSettings } from "../types/settings";
import { getDatabase } from "../services/database";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
} from "../types/settings";

interface SettingsRow {
  key: string;
  value: string;
  updated_at: string;
}

function validateSettings(settings: AppSettings): AppSettings {
  const next = { ...settings };

  const durationKeys: Array<keyof AppSettings> = [
    "focusDurationSeconds",
    "shortBreakDurationSeconds",
    "longBreakDurationSeconds",
    "longBreakInterval",
  ];

  for (const key of durationKeys) {
    const value = next[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new Error(`${key} must be greater than 0`);
    }
  }

  next.focusDurationSeconds = Math.floor(next.focusDurationSeconds);
  next.shortBreakDurationSeconds = Math.floor(next.shortBreakDurationSeconds);
  next.longBreakDurationSeconds = Math.floor(next.longBreakDurationSeconds);
  next.longBreakInterval = Math.floor(next.longBreakInterval);
  next.autoStartBreak = Boolean(next.autoStartBreak);
  next.notificationEnabled = Boolean(next.notificationEnabled);

  return next;
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const rows = await db.select<SettingsRow[]>(
    "SELECT key, value, updated_at FROM settings WHERE key = $1",
    [SETTINGS_KEY],
  );

  if (rows.length === 0) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsed = JSON.parse(rows[0].value) as AppSettings;
    return validateSettings({ ...DEFAULT_SETTINGS, ...parsed });
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(
  settings: AppSettings,
): Promise<AppSettings> {
  const validated = validateSettings(settings);
  const db = await getDatabase();
  const updatedAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [SETTINGS_KEY, JSON.stringify(validated), updatedAt],
  );

  return validated;
}
