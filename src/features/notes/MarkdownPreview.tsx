import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/ui";

interface MarkdownPreviewProps {
  content: string;
}

const previewBase =
  "min-h-80 overflow-auto rounded-input border border-border bg-surface p-4 text-[15px] leading-[1.7]";

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className={cn("markdown-preview", previewBase, "text-text-disabled")}>
        Nothing to preview
      </div>
    );
  }

  return (
    <div className={cn("markdown-preview", previewBase)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
