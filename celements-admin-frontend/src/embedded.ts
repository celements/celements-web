import { createCelementsAdminApp } from '@/bootstrap';
import { registerPageAttachmentsElement } from '@/islands/page-attachments-element';
import { ensureCelementsAdminStyles } from '@/runtime/styles';

ensureCelementsAdminStyles();

class CelAdminElement extends HTMLElement {
  private vueApp: ReturnType<typeof createCelementsAdminApp> | null = null;
  private mounted = false;

  static get observedAttributes() {
    return ['locale', 'local-dev'];
  }

  connectedCallback() {
    if (this.mounted) return;

    const locale = this.dataset.locale ?? undefined;

    // data-local-dev: presence means "true" unless explicitly "false"
    const localDevAttr = this.dataset.localDev;
    const localDev = localDevAttr == null ? undefined : localDevAttr.toLowerCase() !== 'false';

    // Create + mount into this custom element
    this.vueApp = createCelementsAdminApp({ locale, localDev });
    this.vueApp.mount(this);

    this.mounted = true;
  }

  disconnectedCallback() {
    if (this.vueApp) {
      this.vueApp.app.unmount();
      this.vueApp = null;
    }
    this.mounted = false;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (!this.isConnected) return;
    if (oldValue === newValue) return;

    // Simplest/robust: remount on attribute changes
    // (More advanced: update i18n dynamically without remounting.)
    this.disconnectedCallback();
    this.connectedCallback();
  }
}

if (!customElements.get('cel-admin')) {
  customElements.define('cel-admin', CelAdminElement);
}

registerPageAttachmentsElement();
