<template>
  <div class="flex h-full w-full overflow-hidden">
    <div class="flex min-w-0 flex-1 flex-col w-full">
      <VueFinder
        id="page_attachments_vuefinder"
        class="flex-1"
        :driver="driver"
        :config="{
          initialPath: 'attachments://' + spaceName + '/' + docName,
          persist: false,
        }"
        :features="{
          search: true,
          preview: true,
          rename: false,
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
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLogger } from '@/utils/logger';
import { RemoteDriver, VueFinder } from 'vuefinder';
import type { DirEntry } from 'vuefinder';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const logger = useLogger('VueFinder-Attachments');
const route = useRoute();
const spaceName = route.params.spaceName as string;
const docName = route.params.docName as string;

const selectedFiles = ref<DirEntry[]>([]);

const handleSelect = (files: DirEntry[]) => {
  selectedFiles.value = files;
  logger.log('selected files', files);
};

const driver = new RemoteDriver({
  baseURL: `/api/attachments/${spaceName}/${docName}`,
});

const originalGetDownloadUrl = driver.getDownloadUrl.bind(driver);
driver.getDownloadUrl = (file: DirEntry & { url?: string }) => {
  if (file && file.url) {
    return file.url;
  }
  return originalGetDownloadUrl(file);
};

logger.log('driver setup for page attachments');
</script>
