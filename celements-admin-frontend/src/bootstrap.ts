import '@/assets/main.css';

import App from '@/App.vue';
import { useAuthStore } from '@/core/stores/auth';
import { createI18n } from '@/plugins/i18n';
import { createAuthPlugin } from '@/plugins/plugin.auth';
import Store from '@/plugins/plugin.pinia';
import Router from '@/plugins/plugin.router';
import { useLogger } from '@/utils/logger';
import { createApp, type App as VueApp } from 'vue';
import VueFinder from 'vuefinder';
import 'vuefinder/dist/style.css';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';

export type CelementsAdminMountOptions = {
  /**
   * Locale to use for i18n.
   * If omitted, falls back to VITE_DEFAULT_LOCALE.
   */
  locale?: string;

  /**
   * Whether local development features should be enabled.
   * If omitted, falls back to VITE_ENABLE_LOCAL_DEVELOPMENT (default "true").
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

  app.use(PrimeVue, { unstyled: true });
  app.component('Button', Button);

  app.use(Store);

  // register auth plugin with router and store
  const authStore = useAuthStore();
  const Auth = createAuthPlugin(Router, authStore);

  const locale = options.locale ?? import.meta.env.VITE_DEFAULT_LOCALE;

  app.use(Router);
  app.use(createI18n({ locale }));
  app.use(Auth);

  app.use(VueFinder, {
    i18n: {
      en: async () => await import('vuefinder/dist/locales/en.js'),
      de: async () => await import('vuefinder/dist/locales/de.js'),
      fr: async () => await import('vuefinder/dist/locales/fr.js'),
      it: async () => await import('vuefinder/dist/locales/it.js'),
    },
  });

  const localDev =
    options.localDev ?? (import.meta.env.VITE_ENABLE_LOCAL_DEVELOPMENT ?? 'true') === 'true';

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
