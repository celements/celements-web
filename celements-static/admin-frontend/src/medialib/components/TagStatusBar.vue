<template>
  <div
    class="tw:flex tw:h-full tw:w-full tw:items-center tw:gap-3 tw:px-3 tw:py-1.5 tw:text-sm tw:text-[var(--p-text-color)]"
  >
    <!-- ── No file selected: show active filter summary ── -->
    <template v-if="selectedFiles.length === 0">
      <span class="tw:text-[var(--p-text-muted-color)]">
        <template v-if="tagStore.isFilterActive"> Showing files tagged with: </template>
        <template v-else> No filter active · select file(s) to manage labels </template>
      </span>
      <div v-if="tagStore.isFilterActive" class="tw:flex tw:flex-wrap tw:gap-1">
        <span
          v-for="tag in tagStore.activeFilter"
          :key="tag.id"
          class="tw:flex tw:items-center tw:gap-1 tw:rounded-full tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium"
          :class="tag.color"
        >
          {{ tag.label }}
        </span>
      </div>
      <span
        v-if="tagStore.isFilterActive"
        class="tw:ml-auto tw:text-xs tw:text-[var(--p-text-muted-color)]"
      >
        {{ tagStore.filteredPaths.size }} match(es)
      </span>
    </template>

    <!-- ── File(s) selected: tag assignment panel ── -->
    <template v-else>
      <!-- Selection info -->
      <span class="tw:shrink-0 tw:font-medium">
        {{ selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files` }}
      </span>
      <span class="tw:shrink-0 tw:text-[var(--p-text-muted-color)]">Labels:</span>

      <!-- Current tags of the selection (only shown when single file) -->
      <div v-if="selectedFiles.length === 1" class="tw:flex tw:flex-wrap tw:gap-1">
        <TransitionGroup name="tag-chip">
          <span
            v-for="tag in currentTags"
            :key="tag.id"
            class="tw:flex tw:cursor-pointer tw:items-center tw:gap-1 tw:rounded-full tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:transition tw:hover:opacity-80"
            :class="tag.color"
            :title="`Remove '${tag.label}'`"
            @click="tagStore.removeTag(selectedFiles[0].path, tag)"
          >
            {{ tag.label }}
            <span class="tw:opacity-70">×</span>
          </span>
        </TransitionGroup>
        <span
          v-if="currentTags.length === 0"
          class="tw:text-xs tw:text-[var(--p-text-muted-color)]"
        >
          none
        </span>
      </div>

      <!-- Multi-file: show merged tags info -->
      <span v-else class="tw:text-xs tw:text-[var(--p-text-muted-color)]"> (mixed selection) </span>

      <!-- Add tag dropdown trigger -->
      <div ref="dropdownRef" class="tw:relative tw:ml-auto">
        <button
          class="tw:flex tw:items-center tw:gap-1.5 tw:rounded-md tw:border tw:border-[var(--p-content-border-color)] tw:px-2.5 tw:py-1 tw:text-xs tw:text-[var(--p-text-color)] tw:transition tw:hover:bg-[var(--p-content-hover-background)]"
          @click="dropdownOpen = !dropdownOpen"
        >
          <span class="tw:text-base tw:leading-none">＋</span> Add Label
        </button>

        <!-- Dropdown -->
        <Transition name="dropdown">
          <div
            v-if="dropdownOpen"
            class="tw:absolute tw:bottom-full tw:right-0 tw:z-50 tw:mb-1 tw:min-w-[11rem] tw:rounded-lg tw:border tw:border-[var(--p-content-border-color)] tw:bg-[var(--p-surface-0)] tw:py-1 tw:shadow-lg"
          >
            <button
              v-for="tag in tagStore.availableTags"
              :key="tag.id"
              class="tw:flex tw:w-full tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:text-sm tw:transition tw:hover:bg-[var(--p-content-hover-background)]"
              :class="isTagOnAll(tag) ? 'tw:opacity-40 tw:cursor-not-allowed' : 'tw:cursor-pointer'"
              :disabled="isTagOnAll(tag)"
              @click="addTagToSelection(tag)"
            >
              <span :class="['tw:h-2 tw:w-2 tw:rounded-full tw:shrink-0', tag.color]" />
              <span class="tw:flex-1 tw:text-left tw:text-[var(--p-text-color)]">{{
                tag.label
              }}</span>
              <span
                v-if="isTagOnAll(tag)"
                class="tw:text-[10px] tw:text-[var(--p-text-muted-color)]"
                >✓</span
              >
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
watch(
  () => props.selectedFiles,
  () => {
    dropdownOpen.value = false;
  }
);

/** Tags on the single selected file */
const currentTags = computed<Tag[]>(() => {
  if (props.selectedFiles.length !== 1) return [];
  return tagStore.getTagsForFile(props.selectedFiles[0].path);
});

/** Whether a tag is already assigned to ALL selected files */
const isTagOnAll = (tag: Tag): boolean => {
  return props.selectedFiles.every((f) =>
    tagStore.getTagsForFile(f.path).some((t) => t.id === tag.id)
  );
};

/** Assign tag to all selected files */
const addTagToSelection = (tag: Tag) => {
  props.selectedFiles.forEach((f) => tagStore.assignTag(f.path, tag));
  dropdownOpen.value = false;
};
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
