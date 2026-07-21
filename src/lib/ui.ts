/** Shared DesignRule class strings — each variant is complete (no conflicting utilities). */

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const btnBase =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-button border px-[14px] py-[9px] font-medium transition-[border-color,background-color] duration-[120ms] disabled:cursor-not-allowed disabled:opacity-50";

/** Secondary / default button — dark text on white */
export const btn = `${btnBase} border-border-strong bg-surface text-text-primary hover:border-black active:bg-surface-muted`;

/** Primary — white text on black (use alone, do not cn with btn) */
export const btnPrimary = `${btnBase} border-black bg-black text-white hover:border-black hover:bg-[#000000] active:bg-[#2b2b2b]`;

/** Accent — Start Focus etc. */
export const btnAccent = `${btnBase} border-accent bg-accent font-semibold text-black hover:border-accent-hover hover:bg-accent-hover`;

/** Destructive */
export const btnDanger = `${btnBase} border-danger bg-transparent text-danger hover:bg-danger-soft`;

export const input =
  "w-full rounded-input border border-border-strong bg-surface px-3 py-[9px] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black";

export const field = "mb-4 flex flex-col gap-2";
export const fieldLabel = "text-xs font-medium text-text-secondary";

const chipBase =
  "rounded-full border px-3 py-[5px] text-[13px] capitalize";
export const chip = `${chipBase} border-border-strong bg-surface text-text-secondary`;
export const chipActive = `${chipBase} border-black bg-black text-white`;

export const listStack = "flex flex-col gap-0 border-t border-border";
export const listRow =
  "flex items-start justify-between gap-3 rounded-none border-0 border-b border-border bg-transparent px-1 py-3 text-left";
export const listRowClickable = "w-full hover:bg-surface-muted";
export const listRowSelected =
  "bg-surface-muted pl-3 shadow-[inset_3px_0_0_var(--color-black)]";
export const listRowTitle = "mb-1 text-sm font-semibold break-words";
export const listRowMeta = "m-0 text-xs text-text-secondary";

export const panelHeader = "mb-5 flex items-center justify-between gap-3";
export const panelTitle = "m-0 text-[26px] font-bold tracking-[-0.01em]";
