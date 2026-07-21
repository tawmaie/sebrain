interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "กำลังโหลด..." }: LoadingStateProps) {
  return (
    <div className="rounded-card p-5 text-[13px] text-text-secondary" role="status">
      {label}
    </div>
  );
}
