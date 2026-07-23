import { useState } from "react";
import { btnPrimary, cn, input as inputClass } from "../../lib/ui";

interface WorkLogComposeProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function WorkLogCompose({
  onSubmit,
  placeholder = "บันทึกสิ่งที่ทำกับเคสนี้...",
  disabled = false,
  compact = false,
}: WorkLogComposeProps) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!body.trim() || saving || disabled) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit(body);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", compact && "gap-1.5")}>
      <textarea
        className={cn(
          inputClass,
          "min-h-[96px] resize-y font-mono text-[13px] leading-[1.6]",
          compact && "min-h-[72px]",
        )}
        value={body}
        disabled={disabled || saving}
        placeholder={placeholder}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            void handleSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-secondary">
          Ctrl+Enter เพื่อบันทึก
        </span>
        <button
          type="button"
          className={btnPrimary}
          disabled={disabled || saving || !body.trim()}
          onClick={() => void handleSubmit()}
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
      {error ? <p className="m-0 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
