import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Tag, TagDto } from '@/types/medialib';
import {
  apiAssignTag,
  apiCanManageTags,
  apiCreateTag,
  apiDeleteTag,
  apiFetchFilesForTag,
  apiFetchTags,
  apiRemoveTag,
  apiRenameTag,
} from '@/medialib/api/tagApi';
import { colorForIndex, toVueFinderPath } from '@/medialib/utils/tagColors';

export type { Tag } from '@/types/medialib';

export const useTagStore = defineStore('tags', () => {
  // ----- 1. Initial Load & General State -----
  const availableTags = ref<Tag[]>([]);
  const canManageTags = ref<boolean>(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function dtosToTags(dtos: TagDto[]): Tag[] {
    return dtos.map((dto, index) => ({
      id: dto.id,
      label: dto.prettyName || dto.id,
      color: colorForIndex(index),
    }));
  }

  async function loadTags(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      canManageTags.value = await apiCanManageTags();
      const dtos = await apiFetchTags();
      const tags = dtosToTags(dtos);
      availableTags.value = tags;
      fileTagMap.value = await buildFileTagMap(tags);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('[TagStore] loadTags failed:', err);
    } finally {
      loading.value = false;
    }
  }

  // ----- 2. File Tag Mappings -----
  /** filePath → Tag[] */
  const fileTagMap = ref<Record<string, Tag[]>>({});

  async function buildFileTagMap(tags: Tag[]): Promise<Record<string, Tag[]>> {
    // Keys must match VueFinder's file.path format: "local://<filename>"
    const newMap: Record<string, Tag[]> = {};
    await Promise.all(
      tags.map(async (tag) => {
        try {
          const filenames = await apiFetchFilesForTag(tag.id);
          for (const filename of filenames) {
            const path = toVueFinderPath(filename);
            if (!newMap[path]) newMap[path] = [];
            newMap[path].push(tag);
          }
        } catch (err) {
          console.warn(`[TagStore] Could not load files for tag "${tag.id}":`, err);
        }
      }),
    );
    return newMap;
  }

  function getTagsForFile(filePath: string): Tag[] {
    return fileTagMap.value[filePath] ?? [];
  }

  // ----- 3. Sidebar Filtering -----
  /** Tags currently active in the sidebar filter (multi-select) */
  const activeFilter = ref<Tag[]>([]);

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

  // ----- 4. File Tag Operations (Assign/Remove) -----
  function optimisticallyAssignTag(filePath: string, tag: Tag, current: Tag[]): void {
    fileTagMap.value = {
      ...fileTagMap.value,
      [filePath]: [...current, tag],
    };
  }

  function rollbackAssignTag(filePath: string, tag: Tag): void {
    fileTagMap.value = {
      ...fileTagMap.value,
      [filePath]: fileTagMap.value[filePath].filter((t) => t.id !== tag.id),
    };
  }

  /**
   * Assign a tag to a file. Calls the backend and updates local state on success.
   */
  async function assignTag(filePath: string, tag: Tag): Promise<void> {
    const current = fileTagMap.value[filePath] ?? [];
    if (current.some((t) => t.id === tag.id)) return; // already assigned
    optimisticallyAssignTag(filePath, tag, current);
    try {
      await apiAssignTag(tag.id, [filePath]);
    } catch (err) {
      console.error('[TagStore] assignTag failed, rolling back:', err);
      rollbackAssignTag(filePath, tag);
      throw err;
    }
  }

  function optimisticallyRemoveTag(filePath: string, tag: Tag, current: Tag[]): void {
    fileTagMap.value = {
      ...fileTagMap.value,
      [filePath]: current.filter((t) => t.id !== tag.id),
    };
  }

  function rollbackRemoveTag(filePath: string, tag: Tag): void {
    fileTagMap.value = {
      ...fileTagMap.value,
      [filePath]: [...(fileTagMap.value[filePath] ?? []), tag],
    };
  }

  /**
   * Remove a tag from a file. Calls the backend and updates local state on success.
   */
  async function removeTag(filePath: string, tag: Tag): Promise<void> {
    const current = fileTagMap.value[filePath] ?? [];
    optimisticallyRemoveTag(filePath, tag, current);
    try {
      await apiRemoveTag(tag.id, [filePath]);
    } catch (err) {
      console.error('[TagStore] removeTag failed, rolling back:', err);
      rollbackRemoveTag(filePath, tag);
      throw err;
    }
  }

  /** Toggle: assign if absent, remove if present – convenience for the UI */
  async function toggleFileTag(filePath: string, tag: Tag): Promise<void> {
    const current = fileTagMap.value[filePath] ?? [];
    if (current.some((t) => t.id === tag.id)) {
      await removeTag(filePath, tag);
    } else {
      await assignTag(filePath, tag);
    }
  }

  // ----- 5. Tag Management (Create/Delete/Rename) -----
  function optimisticallyCreateTag(label: string): { newId: string; backupTags: Tag[] } {
    const backupTags = [...availableTags.value];
    const newId = `temp-${Date.now()}`;
    const newTag: Tag = { id: newId, label, color: colorForIndex(availableTags.value.length) };
    availableTags.value.push(newTag);
    return { newId, backupTags };
  }

  function finalizeCreatedTag(newId: string, dto: TagDto): void {
    const tagIndex = availableTags.value.findIndex((t) => t.id === newId);
    if (tagIndex !== -1) {
      availableTags.value[tagIndex].id = dto.id;
      availableTags.value[tagIndex].label = dto.prettyName || dto.id;
    }
  }

  async function createTag(label: string): Promise<void> {
    const { newId, backupTags } = optimisticallyCreateTag(label);
    try {
      const dto = await apiCreateTag(label);
      finalizeCreatedTag(newId, dto);
    } catch (err) {
      availableTags.value = backupTags;
      throw err;
    }
  }

  function optimisticallyDeleteTag(tag: Tag): { backupTags: Tag[]; backupMap: Record<string, Tag[]> } {
    const backupTags = [...availableTags.value];
    const backupMap = { ...fileTagMap.value };
    availableTags.value = availableTags.value.filter((t) => t.id !== tag.id);
    activeFilter.value = activeFilter.value.filter((t) => t.id !== tag.id);
    for (const path in fileTagMap.value) {
      fileTagMap.value[path] = fileTagMap.value[path].filter((t) => t.id !== tag.id);
    }
    return { backupTags, backupMap };
  }

  async function deleteTag(tag: Tag): Promise<void> {
    const { backupTags, backupMap } = optimisticallyDeleteTag(tag);
    try {
      await apiDeleteTag(tag.id);
    } catch (err) {
      availableTags.value = backupTags;
      fileTagMap.value = backupMap;
      throw err;
    }
  }

  async function renameTag(tag: Tag, newLabel: string): Promise<void> {
    const prevLabel = tag.label;
    tag.label = newLabel;
    try {
      await apiRenameTag(tag.id, newLabel);
    } catch (err) {
      tag.label = prevLabel;
      throw err;
    }
  }

  return {
    availableTags,
    fileTagMap,
    activeFilter,
    filteredPaths,
    isFilterActive,
    loading,
    error,
    loadTags,
    toggleFilterTag,
    clearFilter,
    getTagsForFile,
    assignTag,
    removeTag,
    toggleFileTag,
    canManageTags,
    createTag,
    deleteTag,
    renameTag,
  };
});
