<template>
  <aside
    class="flex h-full w-56 shrink-0 flex-col gap-1 bg-[var(--p-surface-0)] px-3 py-4"
  >
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-widest text-[var(--p-text-muted-color)]">
        Labels
      </span>
      <div class="flex gap-1">
        <button
          v-if="tagStore.isFilterActive"
          class="rounded px-1.5 py-0.5 text-xs text-[var(--p-primary-color)] transition hover:bg-[var(--p-content-hover-background)]"
          @click="tagStore.clearFilter()"
        >
          Clear
        </button>
        <button
          v-if="tagStore.canManageTags"
          aria-label="Add tag"
          class="rounded px-1 text-[var(--p-text-muted-color)] hover:text-[var(--p-primary-color)] transition hover:bg-[var(--p-content-hover-background)]"
          @click="openAddDialog"
        >
          <FontAwesomeIcon :icon="faPlus" class="text-sm" />
        </button>
      </div>
    </div>

    <!-- Tag list -->
    <ul class="flex flex-col gap-1 list-none">
      <li v-for="tag in tagStore.availableTags" :key="tag.id">
        <div class="group relative flex w-full items-center">
          <button
            :class="[
              'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition',
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
          
          <!-- Management Buttons -->
          <div
            v-if="tagStore.canManageTags"
            class="hidden group-hover:flex items-center absolute right-1 gap-1 rounded bg-[var(--p-surface-0)] opacity-95 px-1 py-0.5 shadow-sm border border-[var(--p-content-border-color)]"
          >
            <button class="p-1 rounded text-[var(--p-text-muted-color)] hover:text-[var(--p-primary-color)] transition" title="Rename" aria-label="Rename" @click.stop="openRenameDialog(tag)">
              <FontAwesomeIcon :icon="faPencil" class="text-xs" />
            </button>
            <button class="p-1 rounded text-[var(--p-text-muted-color)] hover:text-red-500 transition" title="Delete" aria-label="Delete" @click.stop="confirmDelete(tag)">
              <FontAwesomeIcon :icon="faTrashCan" class="text-xs" />
            </button>
          </div>
        </div>
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

    <!-- Modals -->
    <Dialog v-model:visible="isAddModalOpen" header="Add Tag" :modal="true" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-3 py-2">
        <label for="newTagName" class="font-semibold text-sm">Label</label>
        <InputText id="newTagName" v-model="modalLabel" class="w-full" autocomplete="off" autofocus @keyup.enter="confirmAdd" />
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="isAddModalOpen = false" />
        <Button label="Add" :disabled="!modalLabel.trim()" autofocus @click="confirmAdd" />
      </template>
    </Dialog>

    <Dialog v-model:visible="isRenameModalOpen" header="Rename Tag" :modal="true" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-3 py-2">
        <label for="renameTagName" class="font-semibold text-sm">Label</label>
        <InputText id="renameTagName" v-model="modalLabel" class="w-full" autocomplete="off" autofocus @keyup.enter="confirmRename" />
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="isRenameModalOpen = false" />
        <Button label="Rename" :disabled="!modalLabel.trim()" autofocus @click="confirmRename" />
      </template>
    </Dialog>

  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTagStore, type Tag } from '@/medialib/stores/tags';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const tagStore = useTagStore();
const confirm = useConfirm();

const isAddModalOpen = ref(false);
const isRenameModalOpen = ref(false);
const modalLabel = ref('');
const activeTagForRename = ref<Tag | null>(null);

function openAddDialog() {
  modalLabel.value = '';
  isAddModalOpen.value = true;
}

function openRenameDialog(tag: Tag) {
  activeTagForRename.value = tag;
  modalLabel.value = tag.label;
  isRenameModalOpen.value = true;
}

async function confirmAdd() {
  if (!modalLabel.value.trim()) return;
  await tagStore.createTag(modalLabel.value.trim());
  isAddModalOpen.value = false;
}

async function confirmRename() {
  if (!modalLabel.value.trim() || !activeTagForRename.value) return;
  await tagStore.renameTag(activeTagForRename.value, modalLabel.value.trim());
  isRenameModalOpen.value = false;
}

function confirmDelete(tag: Tag) {
  confirm.require({
    message: `Are you sure you want to delete tag "${tag.label}"?`,
    header: 'Confirm Delete',
    icon: 'fa fa-trash-can',
    acceptClass: 'p-button-danger',
    accept: () => tagStore.deleteTag(tag),
  });
}

function isActive(tag: Tag): boolean {
  return tagStore.activeFilter.some((t) => t.id === tag.id);
}

function fileCountForTag(tag: Tag): number {
  return Object.values(tagStore.fileTagMap).filter((tags) =>
    tags.some((t) => t.id === tag.id),
  ).length;
}
</script>
