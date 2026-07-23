import { useEffect, useMemo, useState } from "react";
import type { Task } from "../../types/task";
import { createTaskLogEntry } from "../../repositories/taskLogRepository";
import { WorkLogCompose } from "../log/WorkLogCompose";
import { field, input as inputClass } from "../../lib/ui";

interface TodayQuickLogProps {
  tasks: Task[];
  preferredTaskId: string | null;
}

export function TodayQuickLog({ tasks, preferredTaskId }: TodayQuickLogProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const resolvedTaskId = useMemo(() => {
    if (
      selectedTaskId &&
      tasks.some((task) => task.id === selectedTaskId)
    ) {
      return selectedTaskId;
    }
    if (
      preferredTaskId &&
      tasks.some((task) => task.id === preferredTaskId)
    ) {
      return preferredTaskId;
    }
    return tasks[0]?.id ?? "";
  }, [selectedTaskId, preferredTaskId, tasks]);

  useEffect(() => {
    if (!selectedTaskId && resolvedTaskId) {
      setSelectedTaskId(resolvedTaskId);
    }
  }, [resolvedTaskId, selectedTaskId]);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="rounded-modal border border-border bg-surface p-5">
      <div className="mb-4">
        <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
          QUICK LOG
        </p>
        <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
          บันทึกงานด่วน
        </h2>
        <p className="m-0 mt-1 text-xs text-text-secondary">
          จดสิ่งที่ทำกับเคสที่กำลังทำอยู่
        </p>
      </div>

      <label className={field}>
        <span className="text-xs font-medium text-text-secondary">เคส</span>
        <select
          className={inputClass}
          value={resolvedTaskId}
          onChange={(event) => setSelectedTaskId(event.target.value)}
        >
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </label>

      <WorkLogCompose
        compact
        disabled={!resolvedTaskId}
        placeholder="เช่น ลองค้นแล้วเกิดจาก... แก้ด้วย UPDATE ..."
        onSubmit={async (body) => {
          if (!resolvedTaskId) {
            return;
          }
          await createTaskLogEntry({ taskId: resolvedTaskId, body });
        }}
      />
    </section>
  );
}
