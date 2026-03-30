<template>
  <div class="flex h-full w-full overflow-hidden">
    <!-- ── Left: Tag filter sidebar ── -->
    <TagSidebar />

    <!-- ── Right: VueFinder + status-bar slot ── -->
    <div class="flex min-w-0 flex-1 flex-col w-full">
      <VueFinder
        id="my_vuefinder"
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
import { ref } from 'vue';
import TagSidebar from '@/medialib/components/TagSidebar.vue';
import TagStatusBar from '@/medialib/components/TagStatusBar.vue';

const logger = useLogger('VueFinder');

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

logger.log('driver setup');
</script>
