import { X } from "lucide-react";
import { WorkLogCompose } from "./WorkLogCompose";
import { closeCurrentWindow } from "../../services/windowService";
import { btn } from "../../lib/ui";

interface WorkLogWindowProps {
  taskId: string | null;
  taskLabel: string | null;
  onSubmit: (body: string) => Promise<void>;
}

export function WorkLogWindow({
  taskId,
  taskLabel,
  onSubmit,
}: WorkLogWindowProps) {
  return (
    <main className="flex h-full min-h-0 flex-col bg-surface p-5">
      <header className="mb-5 flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-text-secondary uppercase">
            SeBrain Focus
          </p>
          <h1 className="m-0 mt-1 text-lg">บันทึกการทำงาน</h1>
          <p className="m-0 mt-1 text-xs text-text-secondary">
            {taskId
              ? taskLabel
                ? `เคส: ${taskLabel}`
                : "บันทึกสิ่งที่ทำกับเคสที่กำลังโฟกัส"
              : "ยังไม่ได้เลือกงานสำหรับตัวจับเวลา"}
          </p>
        </div>
        <button
          type="button"
          className={`${btn} min-h-8 px-2`}
          aria-label="ปิดหน้าต่างบันทึก log"
          onClick={() => {
            void closeCurrentWindow();
          }}
        >
          <X size={16} />
        </button>
      </header>

      {taskId ? (
        <WorkLogCompose
          onSubmit={onSubmit}
          placeholder="บันทึกสิ่งที่ทำกับเคสนี้..."
        />
      ) : (
        <div className="rounded-card border border-border bg-surface-muted p-4 text-sm text-text-secondary">
          เปิด SeBrain หน้าหลัก แล้วเลือกงานใน Pomodoro ก่อนบันทึก log
        </div>
      )}
    </main>
  );
}
