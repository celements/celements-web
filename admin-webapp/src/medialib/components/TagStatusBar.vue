<template>
  <div class="flex h-full w-full items-center gap-3 px-3 py-1.5 text-sm text-[var(--p-text-color)]">

    <!-- ── No file selected: show active filter summary ── -->
    <template v-if="selectedFiles.length === 0">
      <span class="text-[var(--p-text-muted-color)]">
        <template v-if="tagStore.isFilterActive">
          Showing files tagged with:
        </template>
        <template v-else>
          No filter active · select file(s) to manage labels
        </template>
      </span>
      <div v-if="tagStore.isFilterActive" class="flex flex-wrap gap-1">
        <span
          v-for="tag in tagStore.activeFilter"
          :key="tag.id"
          class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          :class="tag.color"
        >
          {{ tag.label }}
        </span>
      </div>
      <span v-if="tagStore.isFilterActive" class="ml-auto text-xs text-[var(--p-text-muted-color)]">
        {{ tagStore.filteredPaths.size }} match(es)
      </span>
    </template>

    <!-- ── File(s) selected: tag assignment panel ── -->
    <template v-else>
      <!-- Selection info -->
      <span class="shrink-0 font-medium">
        {{ selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files` }}
      </span>
      <span class="shrink-0 text-[var(--p-text-muted-color)]">Labels:</span>

      <!-- Current tags of the selection (only shown when single file) -->
      <div v-if="selectedFiles.length === 1" class="flex flex-wrap gap-1">
        <TransitionGroup name="tag-chip">
          <span
            v-for="tag in currentTags"
            :key="tag.id"
            class="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition hover:opacity-80"
            :class="tag.color"
            :title="`Remove '${tag.label}'`"
            @click="tagStore.removeTag(selectedFiles[0].path, tag)"
          >
            {{ tag.label }}
            <span class="opacity-70">×</span>
          </span>
        </TransitionGroup>
        <span v-if="currentTags.length === 0" class="text-xs text-[var(--p-text-muted-color)]">
          none
        </span>
      </div>

      <!-- Multi-file: show merged tags info -->
      <span v-else class="text-xs text-[var(--p-text-muted-color)]">
        (mixed selection)
      </span>

      <!-- Add tag dropdown trigger -->
      <div ref="dropdownRef" class="relative ml-auto">
        <button
          class="flex items-center gap-1.5 rounded-md border border-[var(--p-content-border-color)] px-2.5 py-1 text-xs text-[var(--p-text-color)] transition hover:bg-[var(--p-content-hover-background)]"
          @click="dropdownOpen = !dropdownOpen"
        >
          <span class="text-base leading-none">＋</span> Add Label
        </button>

        <!-- Dropdown -->
        <Transition name="dropdown">
          <div
            v-if="dropdownOpen"
            class="absolute bottom-full right-0 z-50 mb-1 min-w-[11rem] rounded-lg border border-[var(--p-content-border-color)] bg-[var(--p-surface-0)] py-1 shadow-lg"
          >
            <button
              v-for="tag in tagStore.availableTags"
              :key="tag.id"
              class="flex w-full items-center gap-2 px-3 py-1.5 text-sm transition hover:bg-[var(--p-content-hover-background)]"
              :class="isTagOnAll(tag) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'"
              :disabled="isTagOnAll(tag)"
              @click="addTagToSelection(tag)"
            >
              <span :class="['h-2 w-2 rounded-full shrink-0', tag.color]" />
              <span class="flex-1 text-left text-[var(--p-text-color)]">{{ tag.label }}</span>
              <span v-if="isTagOnAll(tag)" class="text-[10px] text-[var(--p-text-muted-color)]">✓</span>
            </button>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useTagStore, type Tag } from '@/medialib/stores/tags';

interface DirEntry {
  path: string;
  name: string;
  [key: string]: unknown;
}

const props = defineProps<{
  selectedFiles: DirEntry[];
}>();

const tagStore = useTagStore();
const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false;
});

// Close dropdown when selection changes
watch(() => props.selectedFiles, () => {
  dropdownOpen.value = false;
});

/** Tags on the single selected file */
const currentTags = computed<Tag[]>(() => {
  if (props.selectedFiles.length !== 1) return [];
  return tagStore.getTagsForFile(props.selectedFiles[0].path);
});

/** Whether a tag is already assigned to ALL selected files */
function isTagOnAll(tag: Tag): boolean {
  return props.selectedFiles.every((f) =>
    tagStore.getTagsForFile(f.path).some((t) => t.id === tag.id),
  );
}

/** Assign tag to all selected files */
function addTagToSelection(tag: Tag) {
  props.selectedFiles.forEach((f) => tagStore.assignTag(f.path, tag));
  dropdownOpen.value = false;
}
</script>

<style scoped>
/* Chip enter/leave */
.tag-chip-enter-active,
.tag-chip-leave-active {
  transition: all 0.15s ease;
}
.tag-chip-enter-from,
.tag-chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
