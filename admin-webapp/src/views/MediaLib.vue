<template>
  <div class="flex h-full w-full overflow-hidden">
    <!-- ── Left: Tag filter sidebar ── -->
    <TagSidebar />

    <!-- ── Right: VueFinder + status-bar slot ── -->
    <div class="flex min-w-0 flex-1 flex-col w-full">
      <!--
        :key="filterKey" re-mounts VueFinder when the active tag filter changes.
        VueFinder restores the current folder from localStorage (persist:true),
        so the user stays in the same directory and list() is re-called with
        the fresh filter applied by our driver.list() intercept.
      -->
      <VueFinder
        id="my_vuefinder"
        :key="filterKey"
        class="flex-1"
        :driver="driver"
        :config="{
          initialPath: 'local://public',
          persist: true,
        }"
        :features="{
          search: true,
          preview: true,
          rename: true,
          upload: true,
          delete: true,
          download: true,
          newfolder: false,
          newfile: false,
          move: false,
          copy: false,
          archive: false,
          unarchive: false,
          edit: false,
          fullscreen: false,
          language: false,
          history: false,
          theme: false,
          pinned: false,
        }"
        @select="handleSelect"
      >
        <!-- ── VueFinder status-bar slot ── -->
        <template #status-bar="{ selected }">
          <TagStatusBar :selected-files="selected ?? []" />
        </template>
      </VueFinder>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLogger } from '@/utils/logger';
import { RemoteDriver, VueFinder } from 'vuefinder';
import { computed, onMounted, ref } from 'vue';
import TagSidebar from '@/medialib/components/TagSidebar.vue';
import TagStatusBar from '@/medialib/components/TagStatusBar.vue';
import { useTagStore } from '@/medialib/stores/tags';

const logger = useLogger('VueFinder');
const tagStore = useTagStore();

const selectedFiles = ref<any[]>([]);

const handleSelect = (files: any[]) => {
  selectedFiles.value = files;
  logger.log('selected files', files);
};

const driver = new RemoteDriver({
  baseURL: '/api/files',
});

const originalGetDownloadUrl = driver.getDownloadUrl.bind(driver);
driver.getDownloadUrl = (file: any) => {
  if (file && file.url) {
    return file.url;
  }
  return originalGetDownloadUrl(file);
};

// Intercept list() to apply the active tag filter client-side.
// VueFinder fetches files via the driver; we post-filter the response.
// When filterKey changes, VueFinder re-mounts and re-calls list() automatically.
const originalList = driver.list.bind(driver);
driver.list = async (...args: Parameters<typeof originalList>) => {
  const result = await originalList(...args);
  if (tagStore.isFilterActive && result?.files) {
    result.files = result.files.filter((f: any) =>
      tagStore.filteredPaths.has(f.path),
    );
  }
  return result;
};

// Stable key derived from the active tag filter IDs (sorted for stability).
// Changing this key causes Vue to unmount + remount VueFinder, which re-calls
// list() and applies the current filter. VueFinder restores its path via
// persist:true so the user stays in the same folder.
const filterKey = computed(() =>
  tagStore.activeFilter
    .map((t) => t.id)
    .sort()
    .join(','),
);

logger.log('driver setup');

onMounted(() => {
  tagStore.loadTags();
});
</script>
