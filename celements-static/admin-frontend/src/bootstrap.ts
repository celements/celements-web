import '@/assets/main.css';

import App from '@/App.vue';
import { appConfig } from '@/conf/app';
import { createI18n } from '@/plugins/i18n';
import Store from '@/plugins/plugin.pinia';
import Router from '@/plugins/plugin.router';
import { useLogger } from '@/utils/logger';
import { createApp, type App as VueApp } from 'vue';
import VueFinder from 'vuefinder';
import 'vuefinder/dist/style.css';
import PrimeVue from 'primevue/config';
import Button, { type ButtonProps } from 'primevue/button';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTrashCan, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ConfirmationService from 'primevue/confirmationservice';

export type CelementsAdminMountOptions = {
  /**
   * Locale to use for i18n.
   * If omitted, falls back to VITE_DEFAULT_LOCALE.
   */
  locale?: string;

  /**
   * Whether local development features should be enabled.
   * If omitted, enabled only in Vite development mode.
   */
  localDev?: boolean;
};

export function createCelementsAdminApp(options: CelementsAdminMountOptions = {}): {
  app: VueApp;
  mount: (el: Element | string) => unknown;
} {
  const logger = useLogger('Celements-Admin');

  const app = createApp(App);

  app.config.errorHandler = (err, instance, info) => {
    logger.error(err as string, instance, info);
  };

  app.use(PrimeVue, {
    unstyled: true,
    pt: {
      dialog: {
        root: {
          class:
            'bg-[var(--p-surface-0)] rounded-lg shadow-lg border border-[var(--p-content-border-color)] overflow-hidden flex flex-col w-[25rem] max-w-[90vw]',
        },
        header: {
          class:
            'flex items-center justify-between px-4 py-3 border-b border-[var(--p-content-border-color)]',
        },
        title: { class: 'text-lg font-semibold' },
        content: { class: 'p-4' },
        footer: {
          class:
            'flex justify-end gap-2 px-4 py-3 border-t border-[var(--p-content-border-color)] bg-[var(--p-surface-50)]',
        },
        mask: { class: 'bg-black/50 fixed inset-0 flex items-center justify-center z-50' },
      },
      confirmdialog: {
        root: {
          class:
            'bg-[var(--p-surface-0)] rounded-lg shadow-lg border border-[var(--p-content-border-color)] overflow-hidden w-[25rem] max-w-[90vw]',
        },
        header: {
          class:
            'flex items-center gap-3 px-4 py-3 border-b border-[var(--p-content-border-color)]',
        },
        title: { class: 'text-lg font-semibold' },
        content: { class: 'p-4 flex items-center gap-3' },
        icon: { class: 'text-2xl text-[var(--p-text-muted-color)]' },
        message: { class: 'text-[var(--p-text-color)]' },
        footer: {
          class:
            'flex justify-end gap-2 px-4 py-3 border-t border-[var(--p-content-border-color)] bg-[var(--p-surface-50)]',
        },
        mask: { class: 'bg-black/50 fixed inset-0 flex items-center justify-center z-50' },
      },
      inputtext: {
        root: {
          class:
            'px-3 py-2 border border-[var(--p-content-border-color)] rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-[var(--p-primary-color)] text-[var(--p-text-color)] bg-[var(--p-surface-0)]',
        },
      },
      button: {
        root: ({ props }: { props: ButtonProps }) => ({
          class: [
            'px-3 py-1.5 rounded-md font-semibold transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-hidden',
            props.severity === 'secondary'
              ? 'text-[var(--p-text-color)] hover:bg-[var(--p-content-hover-background)]'
              : 'bg-[var(--p-primary-color)] text-white hover:opacity-80 ring-[var(--p-primary-color)]',
            props.disabled ? 'opacity-50 cursor-not-allowed' : '',
          ],
        }),
      },
    },
  });
  app.use(ConfirmationService);
  app.component('Button', Button);
  library.add(faPlus, faTrashCan, faPencil);
  app.component('FontAwesomeIcon', FontAwesomeIcon);

  app.use(Store);

  const locale = options.locale ?? appConfig.defaultLocale;

  app.use(Router);
  app.use(createI18n({ locale }));

  app.use(VueFinder, {
    i18n: {
      en: async () => await import('vuefinder/dist/locales/en.js'),
      de: async () => await import('vuefinder/dist/locales/de.js'),
      fr: async () => await import('vuefinder/dist/locales/fr.js'),
      it: async () => await import('vuefinder/dist/locales/it.js'),
    },
  });

  const localDev = options.localDev ?? import.meta.env.DEV;

  app.provide('localDev', localDev);

  if (localDev) {
    logger.info('local development enabled');
  }

  return {
    app,
    mount: (el: Element | string) => {
      const target = typeof el === 'string' ? document.querySelector(el) : el;
      if (!target) {
        logger.warn(`mount target not found: ${JSON.stringify(el)}`);
        return;
      }

      logger.debug('mounting app...');
      const res = app.mount(target);
      logger.info('main ready');
      return res;
    },
  };
}
