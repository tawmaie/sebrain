import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/ui";

interface MarkdownPreviewProps {
  content: string;
  compact?: boolean;
}

const previewBase =
  "overflow-auto rounded-input border border-border bg-surface p-4 leading-[1.7]";
const previewDefault = `${previewBase} min-h-80 text-[15px]`;
const previewCompact = `${previewBase} min-h-[180px] text-[13px]`;

export function MarkdownPreview({ content, compact = false }: MarkdownPreviewProps) {
  const previewClass = compact ? previewCompact : previewDefault;

  if (!content.trim()) {
    return (
      <div className={cn("markdown-preview", previewClass, "text-text-disabled")}>
        Nothing to preview
      </div>
    );
  }

  return (
    <div className={cn("markdown-preview", previewClass)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
