interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true" />
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
