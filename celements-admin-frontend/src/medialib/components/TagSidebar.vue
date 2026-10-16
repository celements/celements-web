<template>
  <aside
    class="tw:flex tw:h-full tw:w-56 tw:shrink-0 tw:flex-col tw:gap-1 tw:bg-[var(--p-surface-0)] tw:px-3 tw:py-4"
  >
    <!-- Header -->
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
      <span
        class="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-widest tw:text-[var(--p-text-muted-color)]"
      >
        Labels
      </span>
      <div class="tw:flex tw:gap-1">
        <button
          v-if="tagStore.isFilterActive"
          class="tw:rounded tw:px-1.5 tw:py-0.5 tw:text-xs tw:text-[var(--p-primary-color)] tw:transition tw:hover:bg-[var(--p-content-hover-background)]"
          @click="tagStore.clearFilter()"
        >
          Clear
        </button>
        <button
          v-if="tagStore.canManageTags"
          aria-label="Add tag"
          class="tw:rounded tw:px-1 tw:text-[var(--p-text-muted-color)] tw:hover:text-[var(--p-primary-color)] tw:transition tw:hover:bg-[var(--p-content-hover-background)]"
          @click="openAddDialog"
        >
          <FontAwesomeIcon :icon="faPlus" class="tw:text-sm" />
        </button>
      </div>
    </div>

    <!-- Tag list -->
    <ul class="tw:flex tw:flex-col tw:gap-1 tw:list-none">
      <li v-for="tag in tagStore.availableTags" :key="tag.id">
        <div class="tw:group tw:relative tw:flex tw:w-full tw:items-center">
          <button
            :class="[
              'tw:flex tw:flex-1 tw:items-center tw:gap-2 tw:rounded-md tw:px-2 tw:py-1.5 tw:text-sm tw:transition',
              isActive(tag)
                ? 'tw:bg-[var(--p-highlight-background)] tw:font-semibold tw:text-[var(--p-highlight-color)]'
                : 'tw:text-[var(--p-text-color)] tw:hover:bg-[var(--p-content-hover-background)] tw:hover:text-[var(--p-content-hover-color)]',
            ]"
            @click="tagStore.toggleFilterTag(tag)"
          >
            <!-- Colored dot -->
            <span :class="['tw:h-2.5 tw:w-2.5 tw:shrink-0 tw:rounded-full', tag.color]" />
            <span class="tw:truncate">{{ tag.label }}</span>
            <!-- File count badge (only when files are tagged) -->
            <span
              v-if="fileCountForTag(tag) > 0"
              :class="[
                'tw:ml-auto tw:shrink-0 tw:rounded-full tw:px-1.5 tw:py-0.5 tw:text-[10px] tw:font-semibold',
                isActive(tag)
                  ? 'tw:bg-[var(--p-highlight-focus-background)] tw:text-[var(--p-highlight-focus-color)]'
                  : 'tw:bg-[var(--p-surface-200)] tw:text-[var(--p-text-muted-color)]',
              ]"
            >
              {{ fileCountForTag(tag) }}
            </span>
          </button>

          <!-- Management Buttons -->
          <div
            v-if="tagStore.canManageTags"
            class="tw:hidden tw:group-hover:flex tw:items-center tw:absolute tw:right-1 tw:gap-1 tw:rounded tw:bg-[var(--p-surface-0)] tw:opacity-95 tw:px-1 tw:py-0.5 tw:shadow-sm tw:border tw:border-[var(--p-content-border-color)]"
          >
            <button
              class="tw:p-1 tw:rounded tw:text-[var(--p-text-muted-color)] tw:hover:text-[var(--p-primary-color)] tw:transition"
              title="Rename"
              aria-label="Rename"
              @click.stop="openRenameDialog(tag)"
            >
              <FontAwesomeIcon :icon="faPencil" class="tw:text-xs" />
            </button>
            <button
              class="tw:p-1 tw:rounded tw:text-[var(--p-text-muted-color)] tw:hover:text-red-500 tw:transition"
              title="Delete"
              aria-label="Delete"
              @click.stop="confirmDelete(tag)"
            >
              <FontAwesomeIcon :icon="faTrashCan" class="tw:text-xs" />
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Active filter summary -->
    <div
      v-if="tagStore.isFilterActive"
      class="tw:mt-3 tw:rounded-md tw:border tw:border-[var(--p-content-border-color)] tw:bg-[var(--p-surface-50)] tw:p-2"
    >
      <p
        class="tw:mb-1 tw:text-[10px] tw:font-semibold tw:uppercase tw:tracking-widest tw:text-[var(--p-text-muted-color)]"
      >
        Active filter
      </p>
      <div class="tw:flex tw:flex-wrap tw:gap-1">
        <span
          v-for="tag in tagStore.activeFilter"
          :key="tag.id"
          class="tw:flex tw:items-center tw:gap-1 tw:rounded-full tw:px-2 tw:py-0.5 tw:text-xs"
          :class="tag.color"
        >
          {{ tag.label }}
          <button
            class="tw:ml-0.5 tw:opacity-70 tw:hover:opacity-100"
            @click.stop="tagStore.toggleFilterTag(tag)"
          >
            ×
          </button>
        </span>
      </div>
      <p class="tw:mt-1.5 tw:text-[10px] tw:text-[var(--p-text-muted-color)]">
        {{ tagStore.filteredPaths.size }} file(s) match
      </p>
    </div>

    <!-- Modals -->
    <Dialog
      v-model:visible="isAddModalOpen"
      header="Add Tag"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <div class="tw:flex tw:flex-col tw:gap-3 tw:py-2">
        <label for="newTagName" class="tw:font-semibold tw:text-sm">Label</label>
        <InputText
          id="newTagName"
          v-model="modalLabel"
          class="tw:w-full"
          autocomplete="off"
          autofocus
          @keyup.enter="confirmAdd"
        />
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="isAddModalOpen = false" />
        <Button label="Add" :disabled="!modalLabel.trim()" autofocus @click="confirmAdd" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="isRenameModalOpen"
      header="Rename Tag"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <div class="tw:flex tw:flex-col tw:gap-3 tw:py-2">
        <label for="renameTagName" class="tw:font-semibold tw:text-sm">Label</label>
        <InputText
          id="renameTagName"
          v-model="modalLabel"
          class="tw:w-full"
          autocomplete="off"
          autofocus
          @keyup.enter="confirmRename"
        />
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

const openAddDialog = () => {
  modalLabel.value = '';
  isAddModalOpen.value = true;
};

const openRenameDialog = (tag: Tag) => {
  activeTagForRename.value = tag;
  modalLabel.value = tag.label;
  isRenameModalOpen.value = true;
};

const confirmAdd = async () => {
  if (!modalLabel.value.trim()) return;
  await tagStore.createTag(modalLabel.value.trim());
  isAddModalOpen.value = false;
};

const confirmRename = async () => {
  if (!modalLabel.value.trim() || !activeTagForRename.value) return;
  await tagStore.renameTag(activeTagForRename.value, modalLabel.value.trim());
  isRenameModalOpen.value = false;
};

const confirmDelete = (tag: Tag) => {
  confirm.require({
    message: `Are you sure you want to delete tag "${tag.label}"?`,
    header: 'Confirm Delete',
    icon: 'fa fa-trash-can',
    acceptClass: 'p-button-danger',
    accept: () => tagStore.deleteTag(tag),
  });
};

const isActive = (tag: Tag): boolean => {
  return tagStore.activeFilter.some((t) => t.id === tag.id);
};

const fileCountForTag = (tag: Tag): number => {
  return Object.values(tagStore.fileTagMap).filter((tags) => tags.some((t) => t.id === tag.id))
    .length;
};
</script>
