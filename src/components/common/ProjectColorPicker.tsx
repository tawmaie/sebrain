import { useEffect, useState } from "react";
import { PROJECT_COLORS } from "../../types/project";
import { isValidProjectColor, normalizeProjectColor } from "../../lib/projectColor";
import { cn, fieldLabel, input as inputClass } from "../../lib/ui";

interface ProjectColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ProjectColorPicker({ value, onChange }: ProjectColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const normalizedValue = normalizeProjectColor(value);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PROJECT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "h-7 w-7 shrink-0 rounded-full border-2 transition-transform hover:scale-105",
              normalizedValue === color
                ? "border-black ring-2 ring-black/10"
                : "border-border-strong",
            )}
            style={{ backgroundColor: color }}
            aria-label={`สี ${color}`}
            title={color}
            onClick={() => {
              onChange(color);
              setHexInput(color);
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative shrink-0">
          <span className="sr-only">เลือกสีเอง</span>
          <input
            type="color"
            className="h-9 w-9 cursor-pointer rounded-input border border-border-strong bg-surface p-0.5"
            value={normalizedValue}
            onChange={(event) => {
              const next = event.target.value.toLowerCase();
              onChange(next);
              setHexInput(next);
            }}
          />
        </label>
        <input
          type="text"
          className={cn(inputClass, "min-w-0 flex-1 font-mono text-sm")}
          value={hexInput}
          placeholder="#000000"
          spellCheck={false}
          onChange={(event) => {
            const next = event.target.value;
            setHexInput(next);
            if (isValidProjectColor(next)) {
              onChange(normalizeProjectColor(next));
            }
          }}
          onBlur={() => {
            const next = normalizeProjectColor(hexInput);
            setHexInput(next);
            onChange(next);
          }}
        />
      </div>
    </div>
  );
}

export function ProjectColorField({
  value,
  onChange,
}: ProjectColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className={fieldLabel}>สี</span>
      <ProjectColorPicker value={value} onChange={onChange} />
    </div>
  );
}
