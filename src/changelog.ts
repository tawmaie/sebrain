import changelogData from "../changelog.json";

export type ChangelogCategory =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "security";

export interface ChangelogRelease {
  version: string;
  date: string;
  changes: Partial<Record<ChangelogCategory, string[]>>;
}

export const CHANGELOG_RELEASES = changelogData.releases as ChangelogRelease[];

export const CHANGELOG_CATEGORY_LABELS: Record<ChangelogCategory, string> = {
  added: "เพิ่มใหม่",
  changed: "เปลี่ยนแปลง",
  fixed: "แก้ไข",
  removed: "ลบออก",
  security: "ความปลอดภัย",
};
