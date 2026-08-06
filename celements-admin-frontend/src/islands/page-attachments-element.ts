import PageAttachmentsIslandRoot from '@/islands/PageAttachmentsIslandRoot.vue';
import { createCelementsApplication } from '@/runtime/application';
import type { PageAttachmentsSelectionDetail } from '@/features/page-attachments/types';

export const PAGE_ATTACHMENTS_ELEMENT_NAME = 'cel-page-attachments';

export class CelPageAttachmentsElement extends HTMLElement {
  static observedAttributes = ['space-name', 'doc-name', 'locale', 'local-dev'];
  private application: ReturnType<typeof createCelementsApplication> | null = null;

  get spaceName() {
    return this.getAttribute('space-name') ?? '';
  }
  set spaceName(value: string) {
    this.setAttribute('space-name', value);
  }
  get docName() {
    return this.getAttribute('doc-name') ?? '';
  }
  set docName(value: string) {
    this.setAttribute('doc-name', value);
  }
  get locale() {
    return this.getAttribute('locale') ?? undefined;
  }
  set locale(value: string | undefined) {
    if (value == null) this.removeAttribute('locale');
    else this.setAttribute('locale', value);
  }
  get localDev() {
    const value = this.getAttribute('local-dev');
    return value == null ? undefined : value.toLowerCase() !== 'false';
  }
  set localDev(value: boolean | undefined) {
    if (value == null) this.removeAttribute('local-dev');
    else this.setAttribute('local-dev', String(value));
  }
  connectedCallback() {
    if (this.application) return;
    if (!this.spaceName || !this.docName) return;
    this.application = createCelementsApplication(
      PageAttachmentsIslandRoot,
      {
        spaceName: this.spaceName,
        docName: this.docName,
        locale: this.locale,
        onSelectionChange: (detail: PageAttachmentsSelectionDetail) => {
          this.dispatchEvent(
            new CustomEvent<PageAttachmentsSelectionDetail>('attachment-selection-change', {
              detail,
              bubbles: true,
              composed: true,
            })
          );
        },
      },
      { locale: this.locale, localDev: this.localDev }
    );
    this.application.mount(this);
  }
  disconnectedCallback() {
    this.unmount();
  }
  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (!this.isConnected || oldValue === newValue) return;
    this.unmount();
    this.connectedCallback();
  }
  private unmount() {
    if (!this.application) return;
    this.application.app.unmount();
    this.application = null;
    this.replaceChildren();
  }
}

export const registerPageAttachmentsElement = (
  registry: CustomElementRegistry = customElements
) => {
  if (!registry.get(PAGE_ATTACHMENTS_ELEMENT_NAME)) {
    registry.define(PAGE_ATTACHMENTS_ELEMENT_NAME, CelPageAttachmentsElement);
  }
};
