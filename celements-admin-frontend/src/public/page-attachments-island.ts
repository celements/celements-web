export {
  CelPageAttachmentsElement,
  PAGE_ATTACHMENTS_ELEMENT_NAME,
  registerPageAttachmentsElement,
} from '../islands/page-attachments-element';
export type { PageAttachmentsSelectionDetail } from '../features/page-attachments/types';

import { registerPageAttachmentsElement } from '../islands/page-attachments-element';
import { ensureCelementsAdminStyles } from '../runtime/styles';

if (import.meta.env.DEV) void import('./styles');
ensureCelementsAdminStyles();
registerPageAttachmentsElement();
