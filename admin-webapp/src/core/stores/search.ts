import { useLogger } from '@/utils/logger';
import type { FinderInstance } from 'findandreplacedomtext';
import findAndReplaceDOMText from 'findandreplacedomtext';
import { escapeRegExp } from 'lodash';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export const useSearchStore = defineStore('searchStore', () => {
  const logger = useLogger('SearchOnePage');
  const { t } = useI18n();
  const showSearchField = ref(false);
  const elementToSearch = ref<HTMLElement>();
  const searchTextInput = ref('');
  const searchText = computed(() => searchTextInput.value.trim());
  const finder = ref<FinderInstance>();
  const searchResults = ref<Element[]>([]);
  const currentResultIndex = ref(0);

  const resultMessage = computed(() => {
    if (searchResults.value.length === 0) {
      return t('common.search_no_results');
    }
    return t('common.search_results', { count: searchResults.value.length });
  });

  const search = () => {
    console.log('searchText', searchText.value);
    if (searchText.value.length == 0) {
      logger.debug('No search text provided');
      return;
    }
    if (finder.value || searchResults.value.length > 0 || currentResultIndex.value > 0) {
      resetSearch();
    }
    searchResults.value = [];
    if (elementToSearch.value) {
      finder.value = findAndReplaceDOMText(elementToSearch.value, {
        find: new RegExp(escapeRegExp(searchText.value), 'gi'),
        wrap: 'span',
        wrapClass: 'highlighted',
      });
      document.querySelectorAll('.highlighted').forEach((element: Element) => {
        searchResults.value.push(element);
      });
      if (searchResults.value.length === 0) {
        logger.debug('No results found');
        return;
      }
      searchResults.value[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  const scrollToResult = (index: number) => {
    if (searchResults.value.length > 0) {
      currentResultIndex.value = index % searchResults.value.length;
      const nextElement = searchResults.value[currentResultIndex.value];
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  const resetSearchInput = () => {
    searchTextInput.value = '';
    resetSearch();
  };
  const resetSearch = () => {
    if (finder.value) {
      finder.value.revert();
    }
    searchResults.value = [];
    currentResultIndex.value = 0;
  };

  return {
    showSearchField,
    elementToSearch,
    searchTextInput,
    searchResults,
    currentResultIndex,
    resultMessage,
    search,
    scrollToResult,
    resetSearchInput,
  };
});
