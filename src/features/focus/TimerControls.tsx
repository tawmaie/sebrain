import { useState } from "react";
import type { TimerStatus } from "../../types/pomodoro";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { btn, btnAccent, btnPrimary } from "../../lib/ui";

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinishEarly,
}: TimerControlsProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {status === "idle" ? (
        <button
          type="button"
          className={btnAccent}
          onClick={onStart}
        >
          เริ่มโฟกัส
        </button>
      ) : null}

      {status === "running" ? (
        <>
          <button
            type="button"
            className={btnPrimary}
            onClick={onPause}
          >
            หยุดชั่วคราว
          </button>
          <button type="button" className={btn} onClick={onFinishEarly}>
            จบก่อนเวลา
          </button>
        </>
      ) : null}

      {status === "overtime" ? (
        <>
          <button
            type="button"
            className={btnPrimary}
            onClick={onPause}
          >
            หยุดชั่วคราว
          </button>
          <button type="button" className={btnAccent} onClick={onFinishEarly}>
            จบโฟกัส
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => setConfirmReset(true)}
          >
            รีเซ็ต
          </button>
        </>
      ) : null}

      {status === "paused" ? (
        <>
          <button
            type="button"
            className={btnPrimary}
            onClick={onResume}
          >
            ทำต่อ
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => setConfirmReset(true)}
          >
            รีเซ็ต
          </button>
          <button type="button" className={btn} onClick={onFinishEarly}>
            จบก่อนเวลา
          </button>
        </>
      ) : null}

      <ConfirmDialog
        open={confirmReset}
        title="รีเซ็ตรอบโฟกัส"
        message="รอบที่กำลังทำอยู่จะถูกยกเลิกและเริ่มใหม่จากศูนย์"
        confirmLabel="รีเซ็ต"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          onReset();
        }}
      />
    </div>
  );
}
