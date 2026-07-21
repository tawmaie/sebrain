import { useState } from "react";

interface QuickCaptureProps {
  onSubmit: (content: string) => Promise<void>;
  autoFocus?: boolean;
  placeholder?: string;
}

export function QuickCapture({
  onSubmit,
  autoFocus = false,
  placeholder = "พิมพ์สิ่งที่คิดไว้... กด Enter เพื่อบันทึก",
}: QuickCaptureProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || saving) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="quick-capture">
      <form
        className="quick-capture-form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <input
          type="text"
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          disabled={saving}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !value.trim()}
        >
          {saving ? "กำลังเพิ่ม..." : "เพิ่ม"}
        </button>
      </form>
      {error ? <p className="inline-error">{error}</p> : null}
    </div>
  );
}
