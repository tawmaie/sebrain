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
  variant?: "default" | "mini";
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinishEarly,
  variant = "default",
}: TimerControlsProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const isMini = variant === "mini";
  const buttonClass = isMini
    ? `${btn} min-h-7 px-2.5 py-0 text-xs`
    : btn;
  const buttonPrimaryClass = isMini
    ? `${btnPrimary} min-h-7 px-2.5 py-0 text-xs`
    : btnPrimary;
  const buttonAccentClass = isMini
    ? `${btnAccent} min-h-7 px-2.5 py-0 text-xs`
    : btnAccent;

  return (
    <div
      className={
        isMini
          ? "flex flex-wrap items-center justify-center gap-1"
          : "flex flex-wrap items-center justify-center gap-2"
      }
    >
      {status === "idle" ? (
        <button
          type="button"
          className={buttonAccentClass}
          onClick={onStart}
        >
          {isMini ? "เริ่ม" : "เริ่มโฟกัส"}
        </button>
      ) : null}

      {status === "running" ? (
        <>
          <button
            type="button"
            className={buttonPrimaryClass}
            onClick={onPause}
          >
            {isMini ? "หยุด" : "หยุดชั่วคราว"}
          </button>
          <button type="button" className={buttonClass} onClick={onFinishEarly}>
            {isMini ? "จบ" : "จบก่อนเวลา"}
          </button>
        </>
      ) : null}

      {status === "overtime" ? (
        <>
          <button
            type="button"
            className={buttonPrimaryClass}
            onClick={onPause}
          >
            {isMini ? "หยุด" : "หยุดชั่วคราว"}
          </button>
          <button type="button" className={buttonAccentClass} onClick={onFinishEarly}>
            {isMini ? "จบ" : "จบโฟกัส"}
          </button>
          <button
            type="button"
            className={buttonClass}
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
            className={buttonPrimaryClass}
            onClick={onResume}
          >
            ทำต่อ
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setConfirmReset(true)}
          >
            รีเซ็ต
          </button>
          <button type="button" className={buttonClass} onClick={onFinishEarly}>
            {isMini ? "จบ" : "จบก่อนเวลา"}
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
