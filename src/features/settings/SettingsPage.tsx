import { useEffect, useState } from "react";
import type { AppSettings } from "../../types/settings";
import { getSettings, saveSettings } from "../../repositories/settingsRepository";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";

interface SettingsPageProps {
  onSaved?: () => void;
}

export function SettingsPage({ onSaved }: SettingsPageProps) {
  const [form, setForm] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const settings = await getSettings();
        setForm(settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <LoadingState label="กำลังโหลดการตั้งค่า..." />;
  }

  if (error && !form) {
    return <ErrorMessage message={error} />;
  }

  if (!form) {
    return null;
  }

  return (
    <div className="panel-single settings-page">
      <div className="panel-header">
        <h2>Settings</h2>
        {savedAt ? (
          <span className="muted">
            บันทึกแล้ว {new Date(savedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      <section className="settings-section">
        <h3>ระยะเวลา Pomodoro</h3>
        <label className="field">
          <span>Focus (วินาที)</span>
          <input
            type="number"
            min={1}
            value={form.focusDurationSeconds}
            onChange={(event) =>
              setForm({
                ...form,
                focusDurationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="field">
          <span>Short break (วินาที)</span>
          <input
            type="number"
            min={1}
            value={form.shortBreakDurationSeconds}
            onChange={(event) =>
              setForm({
                ...form,
                shortBreakDurationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="field">
          <span>Long break (วินาที)</span>
          <input
            type="number"
            min={1}
            value={form.longBreakDurationSeconds}
            onChange={(event) =>
              setForm({
                ...form,
                longBreakDurationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="field">
          <span>ทำ Long break ทุก ๆ กี่รอบ</span>
          <input
            type="number"
            min={1}
            value={form.longBreakInterval}
            onChange={(event) =>
              setForm({
                ...form,
                longBreakInterval: Number(event.target.value),
              })
            }
          />
        </label>
      </section>

      <section className="settings-section">
        <h3>พฤติกรรม</h3>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.autoStartBreak}
            onChange={(event) =>
              setForm({ ...form, autoStartBreak: event.target.checked })
            }
          />
          <span>เริ่ม Break ต่อโดยอัตโนมัติ</span>
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.notificationEnabled}
            onChange={(event) =>
              setForm({ ...form, notificationEnabled: event.target.checked })
            }
          />
          <span>เปิดการแจ้งเตือน</span>
        </label>
      </section>

      {error ? <p className="inline-error">{error}</p> : null}

      <button
        type="button"
        className="btn btn-primary"
        disabled={saving}
        onClick={() => {
          void (async () => {
            setSaving(true);
            setError(null);
            try {
              const saved = await saveSettings(form);
              setForm(saved);
              setSavedAt(new Date().toISOString());
              onSaved?.();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setSaving(false);
            }
          })();
        }}
      >
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}
