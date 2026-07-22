import { useEffect, useState } from "react";
import type { AppView } from "../../types/navigation";
import {
  getSearchResultTargetView,
  searchAll,
  type SearchResult,
} from "../../repositories/searchRepository";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import {
  EntryTypeBadge,
  InboxBadge,
  TaskStatusBadge,
} from "../../components/common/TypeBadge";
import { listRow, listRowClickable, listRowMeta, listRowTitle, listStack } from "../../lib/ui";

interface SearchPageProps {
  query: string;
  onNavigate: (view: AppView) => void;
}

export function SearchPage({ query, onNavigate }: SearchPageProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await searchAll(normalizedQuery);
          setResults(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setLoading(false);
        }
      })();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title="ค้นหาทุกอย่างใน SeBrain"
          description="พิมพ์คำค้นหาเพื่อหา Inbox, Tasks และบันทึกทุกประเภท"
        />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <div className="mx-auto w-full max-w-[920px]">
        <header className="mb-5">
          <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
            SEARCH
          </p>
          <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">
            ผลการค้นหา
          </h1>
          <p className="mt-2 mb-0 text-sm text-text-secondary">
            คำค้นหา: <strong className="text-text-primary">{normalizedQuery}</strong>
            {!loading ? ` · ${results.length} รายการ` : null}
          </p>
        </header>

        {loading ? <LoadingState label="กำลังค้นหา..." /> : null}
        {!loading && error ? (
          <ErrorMessage message={error} onRetry={() => void searchAll(normalizedQuery).then(setResults)} />
        ) : null}

        {!loading && !error && results.length === 0 ? (
          <EmptyState
            title="ไม่พบผลลัพธ์"
            description="ลองใช้คำค้นหาอื่น หรือตรวจสอบการสะกดอีกครั้ง"
          />
        ) : null}

        {!loading && !error && results.length > 0 ? (
          <div className={listStack}>
            {results.map((result) => (
              <button
                key={`${result.kind}-${result.id}`}
                type="button"
                className={`${listRow} ${listRowClickable}`}
                onClick={() => onNavigate(getSearchResultTargetView(result))}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {result.kind === "inbox" ? <InboxBadge /> : null}
                    {result.kind === "task" && result.taskStatus ? (
                      <TaskStatusBadge status={result.taskStatus} />
                    ) : null}
                    {result.kind === "entry" && result.entryType ? (
                      <EntryTypeBadge type={result.entryType} />
                    ) : null}
                    <p className={`${listRowTitle} mb-0 min-w-0 truncate`}>
                      {result.title}
                    </p>
                  </div>
                  {result.snippet ? (
                    <p className={`${listRowMeta} line-clamp-2`}>{result.snippet}</p>
                  ) : null}
                  <p className={listRowMeta}>
                    อัปเดต {new Date(result.updatedAt).toLocaleString("th-TH")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
