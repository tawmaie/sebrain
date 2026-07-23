import { btnPrimary, input } from "../../lib/ui";

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenCapture: () => void;
  searchInputRef?: React.Ref<HTMLInputElement>;
}

export function Topbar({
  searchQuery,
  onSearchChange,
  onOpenCapture,
  searchInputRef,
}: TopbarProps) {
  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border bg-surface px-5 py-3">
      <span />
      <div className="w-full max-w-[420px]">
        <input
          ref={searchInputRef}
          type="search"
          className={input}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ค้นหาทุกอย่าง... Inbox, Tasks, Notes, Log (Ctrl+K)"
          aria-label="Search"
        />
      </div>
      <button
        type="button"
        className={btnPrimary}
        onClick={onOpenCapture}
      >
        + เพิ่มไอเดีย
      </button>
    </header>
  );
}
