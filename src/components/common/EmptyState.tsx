interface EmptyStateProps {
  title: string;
  description?: string;
  compact?: boolean;
}

export function EmptyState({ title, description, compact }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="empty-state-inline">
        <p>{title}</p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true" />
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
