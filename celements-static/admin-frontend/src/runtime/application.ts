import { appConfig } from '@/conf/app';
import { createI18n } from '@/plugins/i18n';
import { createCelementsPinia } from '@/plugins/plugin.pinia';
import { useLogger } from '@/utils/logger';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPencil, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp, type Component, type Plugin } from 'vue';
import VueFinder from 'vuefinder';
import Button, { type ButtonProps } from 'primevue/button';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';

export interface CelementsApplicationOptions {
  locale?: string;
  localDev?: boolean;
  router?: Plugin;
}

export const createCelementsApplication = (
  rootComponent: Component,
  rootProps: Record<string, unknown> = {},
  options: CelementsApplicationOptions = {}
) => {
  const logger = useLogger('Celements-Admin');
  const app = createApp(rootComponent, rootProps);
  const pinia = createCelementsPinia();
  app.config.errorHandler = (err, instance, info) => {
    logger.error(err, instance, info);
  };
  app.use(PrimeVue, {
    unstyled: true,
    pt: {
      dialog: {
        root: {
          class:
            'cel-admin-teleport tw:bg-[var(--p-surface-0)] tw:rounded-lg tw:shadow-lg tw:border tw:border-[var(--p-content-border-color)] tw:overflow-hidden tw:flex tw:flex-col tw:w-[25rem] tw:max-w-[90vw]',
        },
        header: {
          class:
            'tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-[var(--p-content-border-color)]',
        },
        title: { class: 'tw:text-lg tw:font-semibold' },
        content: { class: 'tw:p-4' },
        footer: {
          class:
            'tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:py-3 tw:border-t tw:border-[var(--p-content-border-color)] tw:bg-[var(--p-surface-50)]',
        },
        mask: {
          class:
            'cel-admin-teleport tw:bg-black/50 tw:fixed tw:inset-0 tw:flex tw:items-center tw:justify-center tw:z-50',
        },
      },
      confirmdialog: {
        root: {
          class:
            'cel-admin-teleport tw:bg-[var(--p-surface-0)] tw:rounded-lg tw:shadow-lg tw:border tw:border-[var(--p-content-border-color)] tw:overflow-hidden tw:w-[25rem] tw:max-w-[90vw]',
        },
        header: {
          class:
            'tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-3 tw:border-b tw:border-[var(--p-content-border-color)]',
        },
        title: { class: 'tw:text-lg tw:font-semibold' },
        content: { class: 'tw:p-4 tw:flex tw:items-center tw:gap-3' },
        icon: { class: 'tw:text-2xl tw:text-[var(--p-text-muted-color)]' },
        message: { class: 'tw:text-[var(--p-text-color)]' },
        footer: {
          class:
            'tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:py-3 tw:border-t tw:border-[var(--p-content-border-color)] tw:bg-[var(--p-surface-50)]',
        },
        mask: {
          class:
            'cel-admin-teleport tw:bg-black/50 tw:fixed tw:inset-0 tw:flex tw:items-center tw:justify-center tw:z-50',
        },
      },
      inputtext: {
        root: {
          class:
            'tw:px-3 tw:py-2 tw:border tw:border-[var(--p-content-border-color)] tw:rounded-md tw:w-full tw:focus:outline-hidden tw:focus:ring-2 tw:focus:ring-[var(--p-primary-color)] tw:text-[var(--p-text-color)] tw:bg-[var(--p-surface-0)]',
        },
      },
      button: {
        root: ({ props }: { props: ButtonProps }) => ({
          class: [
            'tw:px-3 tw:py-1.5 tw:rounded-md tw:font-semibold tw:transition-colors tw:focus:ring-2 tw:focus:ring-offset-1 tw:focus:outline-hidden',
            props.severity === 'secondary'
              ? 'tw:text-[var(--p-text-color)] tw:hover:bg-[var(--p-content-hover-background)]'
              : 'tw:bg-[var(--p-primary-color)] tw:text-white tw:hover:opacity-80 tw:ring-[var(--p-primary-color)]',
            props.disabled ? 'tw:opacity-50 tw:cursor-not-allowed' : '',
          ],
        }),
      },
    },
  });
  app.use(ConfirmationService);
  // PrimeVue intentionally publishes this component under its single-word API name.
  // eslint-disable-next-line vue/no-reserved-component-names, vue/multi-word-component-names
  app.component('Button', Button);
  library.add(faPlus, faTrashCan, faPencil);
  app.component('FontAwesomeIcon', FontAwesomeIcon);
  app.use(pinia);
  if (options.router) app.use(options.router);
  app.use(createI18n({ locale: options.locale ?? appConfig.defaultLocale }));
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
  if (localDev) logger.info('local development enabled');
  return {
    app,
    pinia,
    mount(el: Element | string) {
      const target = typeof el === 'string' ? document.querySelector(el) : el;
      if (!target) {
        logger.warn(`mount target not found: ${JSON.stringify(el)}`);
        return;
      }
      logger.debug('mounting app...');
      const result = app.mount(target);
      logger.info('main ready');
      return result;
    },
  };
};
