interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "กำลังโหลด..." }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status">
      {label}
    </div>
  );
}
