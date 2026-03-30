import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Tag {
  id: string;
  label: string;
  color: string; // tailwind bg-color class, e.g. 'bg-teal-500'
}

// ---------------------------------------------------------------------------
// Hardcoded available tags – replace with API call later
// ---------------------------------------------------------------------------
const HARDCODED_TAGS: Tag[] = [
  { id: 'finance', label: 'Finance', color: 'bg-emerald-500' },
  { id: 'contracts', label: 'Contracts', color: 'bg-blue-500' },
  { id: 'to-review', label: 'To Review', color: 'bg-amber-500' },
  { id: 'press', label: 'Press', color: 'bg-violet-500' },
  { id: 'archive', label: 'Archive', color: 'bg-slate-500' },
  { id: 'marketing', label: 'Marketing', color: 'bg-rose-500' },
];

export const useTagStore = defineStore('tags', () => {
  // ----- state ----------------------------------------------------------------
  const availableTags = ref<Tag[]>(HARDCODED_TAGS);

  /** filePath → Tag[] */
  const fileTagMap = ref<Record<string, Tag[]>>({});

  /** Tags currently active in the sidebar filter (multi-select) */
  const activeFilter = ref<Tag[]>([]);

  // ----- getters --------------------------------------------------------------

  /** Paths that carry ALL currently active filter tags (AND logic) */
  const filteredPaths = computed<Set<string>>(() => {
    if (activeFilter.value.length === 0) return new Set();
    return new Set(
      Object.entries(fileTagMap.value)
        .filter(([, tags]) =>
          activeFilter.value.every((ft) => tags.some((t) => t.id === ft.id)),
        )
        .map(([path]) => path),
    );
  });

  const isFilterActive = computed(() => activeFilter.value.length > 0);

  // ----- actions --------------------------------------------------------------

  function toggleFilterTag(tag: Tag) {
    const idx = activeFilter.value.findIndex((t) => t.id === tag.id);
    if (idx === -1) {
      activeFilter.value = [...activeFilter.value, tag];
    } else {
      activeFilter.value = activeFilter.value.filter((t) => t.id !== tag.id);
    }
  }

  function clearFilter() {
    activeFilter.value = [];
  }

  function getTagsForFile(filePath: string): Tag[] {
    return fileTagMap.value[filePath] ?? [];
  }

  function assignTag(filePath: string, tag: Tag) {
    const current = fileTagMap.value[filePath] ?? [];
    if (!current.some((t) => t.id === tag.id)) {
      fileTagMap.value = {
        ...fileTagMap.value,
        [filePath]: [...current, tag],
      };
    }
  }

  function removeTag(filePath: string, tag: Tag) {
    const current = fileTagMap.value[filePath] ?? [];
    fileTagMap.value = {
      ...fileTagMap.value,
      [filePath]: current.filter((t) => t.id !== tag.id),
    };
  }

  /** Toggle: assign if absent, remove if present – convenience for the UI */
  function toggleFileTag(filePath: string, tag: Tag) {
    const current = fileTagMap.value[filePath] ?? [];
    if (current.some((t) => t.id === tag.id)) {
      removeTag(filePath, tag);
    } else {
      assignTag(filePath, tag);
    }
  }

  return {
    availableTags,
    fileTagMap,
    activeFilter,
    filteredPaths,
    isFilterActive,
    toggleFilterTag,
    clearFilter,
    getTagsForFile,
    assignTag,
    removeTag,
    toggleFileTag,
  };
});
