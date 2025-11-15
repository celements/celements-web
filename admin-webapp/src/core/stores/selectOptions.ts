import type { Option, Tag } from '@/core/types/selectOptions';
import { useLogger } from '@/utils/logger';
import { computedAsync } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export const useSelectOptionsStore = defineStore('selectOptions', () => {
  const logger = useLogger('selectOptionsStore');
  logger.debug('init selectOptionsStore');
  const { t, locale } = useI18n();

  const fetchSelectOptions = async (path: string) => {
    logger.debug('fetchSelectOptions: ', path);
    try {
      const url: URL = new URL(`/api/v1/celtags/${path}`, import.meta.env.VITE_PROGON_API_URL);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Response status: ${response.status}');
      }
      return (await response.json()) as Tag[];
    } catch (error) {
      logger.error('Error: ', error);
      return [];
    }
  };

  const helvetialevelOptions = computedAsync<Tag[]>(async () => {
    return await fetchSelectOptions('helvetialevel');
  }, []);
  const lastsiteOptions = computedAsync<Tag[]>(async () => {
    return await fetchSelectOptions('lastsite');
  }, []);
  const titledegreeOptions = computedAsync(async () => {
    return await fetchSelectOptions('titledegree');
  }, []);
  const dutiesOptions = computedAsync(async () => await fetchSelectOptions('duties'), []);

  const languageOptions = computed<Option[]>(() => [
    { value: 'de', label: t('forms.german') },
    { value: 'en', label: t('forms.english') },
    { value: 'fr', label: t('forms.french') },
    { value: 'it', label: t('forms.italian') },
  ]);

  const sexOptions = computed<Option[]>(() => [
    { value: 'm', label: t('forms.male') },
    { value: 'f', label: t('forms.female') },
    { value: 'd', label: t('forms.diverse') },
  ]);

  const getLabel = (option: Tag) => {
    logger.debug('Getting label for option: ', option);
    return option.prettyName[locale.value];
  };

  return {
    helvetialevelOptions,
    lastsiteOptions,
    titledegreeOptions,
    dutiesOptions,
    languageOptions,
    sexOptions,
    getLabel,
  };
});
