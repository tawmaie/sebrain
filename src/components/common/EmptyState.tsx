interface EmptyStateProps {
  title: string;
  description?: string;
  compact?: boolean;
}

export function EmptyState({ title, description, compact }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="py-3 text-[13px] text-text-disabled">
        <p>{title}</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface px-5 py-8 text-center text-text-secondary">
      <span
        className="zebra-mark-soft mx-auto mb-3 block h-5 w-7 rounded-[6px] opacity-85"
        aria-hidden="true"
      />
      <h3 className="mb-1 text-[15px] text-text-primary">{title}</h3>
      {description ? <p className="m-0 text-[13px]">{description}</p> : null}
    </div>
  );
}
