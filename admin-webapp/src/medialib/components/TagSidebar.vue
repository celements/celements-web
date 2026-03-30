<template>
  <aside
    class="flex h-full w-56 shrink-0 flex-col gap-1 bg-[var(--p-surface-0)] px-3 py-4"
  >
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-widest text-[var(--p-text-muted-color)]">
        Labels
      </span>
      <button
        v-if="tagStore.isFilterActive"
        class="rounded px-1.5 py-0.5 text-xs text-[var(--p-primary-color)] transition hover:bg-[var(--p-content-hover-background)]"
        @click="tagStore.clearFilter()"
      >
        Clear
      </button>
    </div>

    <!-- Tag list -->
    <ul class="flex flex-col gap-1 list-none">
      <li v-for="tag in tagStore.availableTags" :key="tag.id">
        <button
          :class="[
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition',
            isActive(tag)
              ? 'bg-[var(--p-highlight-background)] font-semibold text-[var(--p-highlight-color)]'
              : 'text-[var(--p-text-color)] hover:bg-[var(--p-content-hover-background)] hover:text-[var(--p-content-hover-color)]',
          ]"
          @click="tagStore.toggleFilterTag(tag)"
        >
          <!-- Colored dot -->
          <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', tag.color]" />
          <span class="truncate">{{ tag.label }}</span>
          <!-- File count badge (only when files are tagged) -->
          <span
            v-if="fileCountForTag(tag) > 0"
            :class="[
              'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
              isActive(tag)
                ? 'bg-[var(--p-highlight-focus-background)] text-[var(--p-highlight-focus-color)]'
                : 'bg-[var(--p-surface-200)] text-[var(--p-text-muted-color)]',
            ]"
          >
            {{ fileCountForTag(tag) }}
          </span>
        </button>
      </li>
    </ul>

    <!-- Active filter summary -->
    <div
      v-if="tagStore.isFilterActive"
      class="mt-3 rounded-md border border-[var(--p-content-border-color)] bg-[var(--p-surface-50)] p-2"
    >
      <p class="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--p-text-muted-color)]">
        Active filter
      </p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="tag in tagStore.activeFilter"
          :key="tag.id"
          class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
          :class="tag.color"
        >
          {{ tag.label }}
          <button
            class="ml-0.5 opacity-70 hover:opacity-100"
            @click.stop="tagStore.toggleFilterTag(tag)"
          >
            ×
          </button>
        </span>
      </div>
      <p class="mt-1.5 text-[10px] text-[var(--p-text-muted-color)]">
        {{ tagStore.filteredPaths.size }} file(s) match
      </p>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { useTagStore, type Tag } from '@/medialib/stores/tags';

const tagStore = useTagStore();

function isActive(tag: Tag): boolean {
  return tagStore.activeFilter.some((t) => t.id === tag.id);
}

function fileCountForTag(tag: Tag): number {
  return Object.values(tagStore.fileTagMap).filter((tags) =>
    tags.some((t) => t.id === tag.id),
  ).length;
}
</script>
