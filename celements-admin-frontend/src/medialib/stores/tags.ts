import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Tag, TagDto } from '@/types/medialib';

export type { Tag } from '@/types/medialib';

// ---------------------------------------------------------------------------
// API base path – matches the VueFinder RemoteDriver base URL
// ---------------------------------------------------------------------------
const API_BASE = '/api/files';

// ---------------------------------------------------------------------------
// Deterministic color palette assigned by tag index
// (backend has no color concept – we assign a stable color client-side)
// ---------------------------------------------------------------------------
const COLOR_PALETTE = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-slate-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-lime-500',
  'bg-indigo-500',
];

function colorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/**
 * Converts a bare filename (as returned by /api/files/tags/files) to the
 * full VueFinder path used as keys in fileTagMap and for file selection.
 * e.g. "foo.jpg" → "local://foo.jpg"
 */
function toVueFinderPath(filename: string): string {
  if (filename.includes('://')) return filename; // already a full path
  return `local://${filename}`;
}


// ---------------------------------------------------------------------------
// Internal API helpers
// ---------------------------------------------------------------------------
async function apiFetchTags(): Promise<TagDto[]> {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error(`GET ${API_BASE}/tags failed: ${res.status}`);
  return res.json() as Promise<TagDto[]>;
}

async function apiFetchFilesForTag(tagId: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/tags/files?tagId=${encodeURIComponent(tagId)}`);
  if (!res.ok)
    throw new Error(`GET ${API_BASE}/tags/files?tagId=${tagId} failed: ${res.status}`);
  return res.json() as Promise<string[]>;
}

async function apiAssignTag(tagId: string, filePaths: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, filePaths }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/assign failed: ${res.status}`);
}

async function apiRemoveTag(tagId: string, filePaths: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, filePaths }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/remove failed: ${res.status}`);
}

async function apiCreateTag(label: string): Promise<TagDto> {
  const res = await fetch(`${API_BASE}/tags/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/create failed: ${res.status}`);
  return res.json() as Promise<TagDto>;
}

async function apiDeleteTag(tagId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/delete failed: ${res.status}`);
}

async function apiRenameTag(tagId: string, newLabel: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tags/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, newLabel }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/rename failed: ${res.status}`);
}

async function apiCanManageTags(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/tags/can-manage`);
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.canManage;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useTagStore = defineStore('tags', () => {
  // ----- state ----------------------------------------------------------------
  const availableTags = ref<Tag[]>([]);
  const canManageTags = ref<boolean>(false);

  /** filePath → Tag[] */
  const fileTagMap = ref<Record<string, Tag[]>>({});

  /** Tags currently active in the sidebar filter (multi-select) */
  const activeFilter = ref<Tag[]>([]);

  /** True while the initial tags+mappings load is in progress */
  const loading = ref(false);

  /** Error message if the initial load failed */
  const error = ref<string | null>(null);

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

  /**
   * Load all tags from the backend and populate fileTagMap.
   * Designed to be called once on app mount / store initialisation.
   */
  function dtosToTags(dtos: TagDto[]): Tag[] {
    return dtos.map((dto, index) => ({
      id: dto.id,
      label: dto.prettyName || dto.id,
      color: colorForIndex(index),
    }));
  }

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

  /**
   * Assign a tag to a file. Calls the backend and updates local state on success.
   */
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

  /**
   * Remove a tag from a file. Calls the backend and updates local state on success.
   */
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
    } catch(err) {
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
