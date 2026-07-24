export interface AppSettings {
  focusDurationSeconds: number;
  shortBreakDurationSeconds: number;
  longBreakDurationSeconds: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  notificationEnabled: boolean;
  defaultProjectId: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDurationSeconds: 1500,
  shortBreakDurationSeconds: 300,
  longBreakDurationSeconds: 900,
  longBreakInterval: 4,
  autoStartBreak: false,
  notificationEnabled: true,
  defaultProjectId: null,
};

export const SETTINGS_KEY = "app_settings";
