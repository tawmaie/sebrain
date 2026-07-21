import { useState } from "react";
import { btnPrimary, input as inputClass } from "../../lib/ui";

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
    <div>
      <form
        className="mb-5 grid grid-cols-[1fr_auto] gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <input
          type="text"
          className={inputClass}
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          disabled={saving}
        />
        <button
          type="submit"
          className={btnPrimary}
          disabled={saving || !value.trim()}
        >
          {saving ? "กำลังเพิ่ม..." : "เพิ่ม"}
        </button>
      </form>
      {error ? <p className="mt-2 mb-0 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
