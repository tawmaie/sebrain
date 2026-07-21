export interface Note {
  id: string;
  title: string;
  contentMarkdown: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  contentMarkdown?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}
