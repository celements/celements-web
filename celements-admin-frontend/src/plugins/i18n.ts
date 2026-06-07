import { messages } from '@/conf/locale';
import { createI18n as createVueI18n, type I18nOptions } from 'vue-i18n';

export const createI18n = (options: I18nOptions) =>
  createVueI18n({
    legacy: false,
    messages,
    // datetimeFormats: datetime,
    // numberFormats: number,
    fallbackWarn: false,
    fallbackLocale: import.meta.env.VITE_DEFAULT_LOCALE,
    ...options,
  });
