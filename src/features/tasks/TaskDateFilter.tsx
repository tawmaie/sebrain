import type { TaskDateField } from "../../types/task";
import { TASK_DATE_FIELD_LABELS } from "../../lib/taskDateFilter";
import { btn, chip, chipActive, cn, fieldLabel, input } from "../../lib/ui";

interface TaskDateFilterProps {
  open: boolean;
  onToggle: () => void;
  dateField: TaskDateField;
  onDateFieldChange: (value: TaskDateField) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onClear: () => void;
}

export function TaskDateFilter({
  open,
  onToggle,
  dateField,
  onDateFieldChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
}: TaskDateFilterProps) {
  const active = Boolean(fromDate || toDate);

  return (
    <div className="mb-4 border-b border-border pb-4">
      <button
        type="button"
        className={cn(
          "mb-0 flex w-full items-center justify-between gap-2 rounded-button border-none bg-transparent px-0 py-1 text-left",
          "text-sm font-medium text-text-primary hover:text-text-primary",
        )}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>กรองตามวันที่</span>
        <span className="flex items-center gap-2 text-xs font-normal text-text-secondary">
          {active ? (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-success">
              ใช้งานอยู่
            </span>
          ) : null}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </span>
      </button>

      {open ? (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <p className={fieldLabel}>อ้างอิงจาก</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {(["created", "completed"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={dateField === value ? chipActive : chip}
                  onClick={() => onDateFieldChange(value)}
                >
                  {TASK_DATE_FIELD_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>จาก</span>
            <input
              type="date"
              className={input}
              value={fromDate}
              onChange={(event) => onFromDateChange(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>ถึง</span>
            <input
              type="date"
              className={input}
              value={toDate}
              onChange={(event) => onToDateChange(event.target.value)}
            />
          </label>

          {dateField === "completed" ? (
            <p className="m-0 text-[11px] leading-relaxed text-text-secondary">
              แสดงเฉพาะเคสที่ปิดแล้วและมีวันที่ปิดเคสในช่วงที่เลือก
            </p>
          ) : null}

          {active ? (
            <button type="button" className={cn(btn, "w-full")} onClick={onClear}>
              ล้างช่วงวันที่
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
