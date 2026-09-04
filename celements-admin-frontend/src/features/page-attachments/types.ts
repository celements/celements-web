import type { DirEntry } from 'vuefinder';

export interface PageAttachmentsDocument {
  spaceName: string;
  docName: string;
}

export interface PageAttachmentsProps extends PageAttachmentsDocument {
  locale?: string;
  canUpload: boolean;
  canDelete: boolean;
}

export interface PageAttachmentsActionContext {
  document: PageAttachmentsDocument;
  path: string;
  count: number;
  selectedAttachments: readonly DirEntry[];
}

export interface PageAttachmentsSelectionDetail {
  document: PageAttachmentsDocument;
  selectedAttachments: readonly DirEntry[];
}
