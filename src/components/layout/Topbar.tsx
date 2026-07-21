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
    <header className="topbar">
      <span />
      <div className="topbar-search">
        <input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ค้นหา Task, Note, Inbox... (Ctrl+K)"
          aria-label="Search"
        />
      </div>
      <button type="button" className="btn btn-primary" onClick={onOpenCapture}>
        + เพิ่มไอเดีย
      </button>
    </header>
  );
}
