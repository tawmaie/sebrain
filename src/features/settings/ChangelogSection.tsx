import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  CHANGELOG_CATEGORY_LABELS,
  CHANGELOG_RELEASES,
  type ChangelogCategory,
} from "../../changelog";
import { APP_VERSION } from "../../version";
import { cn } from "../../lib/ui";

const CATEGORY_ORDER: ChangelogCategory[] = [
  "added",
  "changed",
  "fixed",
  "removed",
  "security",
];

function formatReleaseDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ChangelogSection() {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    APP_VERSION,
  );

  return (
    <section className="border-t border-border pt-4">
      <h3 className="mb-1 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
        เกี่ยวกับแอป
      </h3>
      <p className="mb-4 text-sm text-text-secondary">
        SeBrain เวอร์ชัน{" "}
        <span className="font-semibold text-text-primary">{APP_VERSION}</span>
      </p>

      <h4 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
        บันทึกการเปลี่ยนแปลง
      </h4>

      <div className="flex flex-col gap-2">
        {CHANGELOG_RELEASES.map((release) => {
          const isExpanded = expandedVersion === release.version;
          const isCurrent = release.version === APP_VERSION;

          return (
            <div
              key={release.version}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-muted"
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedVersion(isExpanded ? null : release.version)
                }
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      v{release.version}
                    </span>
                    {isCurrent ? (
                      <span className="rounded-full bg-black px-2 py-0.5 text-[11px] font-medium text-white">
                        ปัจจุบัน
                      </span>
                    ) : null}
                  </div>
                  <p className="m-0 mt-0.5 text-xs text-text-secondary">
                    {formatReleaseDate(release.date)}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-text-secondary transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>

              {isExpanded ? (
                <div className="border-t border-border px-4 py-3">
                  {CATEGORY_ORDER.map((category) => {
                    const items = release.changes[category];
                    if (!items?.length) {
                      return null;
                    }

                    return (
                      <div key={category} className="mb-3 last:mb-0">
                        <p className="mb-1.5 text-xs font-semibold text-text-secondary">
                          {CHANGELOG_CATEGORY_LABELS[category]}
                        </p>
                        <ul className="m-0 list-disc space-y-1 pl-5 text-sm text-text-primary">
                          {items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
