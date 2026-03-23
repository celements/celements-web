<template>
  <div>
    <VueFinder
      id="my_vuefinder"
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

        // disable creation
        newfolder: false,
        newfile: false,

        // optionally disable other advanced operations
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
      <!-- :custom-uploader="customUploader" -->
    <Button v-if="selectedFiles.length > 0" label="set Favorite" @click="setFavorite()" />
  </div>
</template>

<script lang="ts" setup>
import { useLogger } from '@/utils/logger';
import { RemoteDriver, VueFinder } from 'vuefinder';
import Button from 'primevue/button';
import { ref } from 'vue';

const logger=useLogger("VueFinder");

const selectedFiles = ref<any[]>([]);

const handleSelect = (files: any[]) => {
  selectedFiles.value = files;
  logger.log('selected files', files);
};

const setFavorite = () => {
  const file = selectedFiles.value[0];
  logger.log('setFavorite', file);
};

const driver = new RemoteDriver({
  baseURL: '/api/files',
});

// const customUploader = (uppy: any) => {
//   const originalAddFile = uppy.addFile.bind(uppy);

//   uppy.addFile = (file: any) => {
//     logger.log('[uppy addFile called]', file?.name ?? file);
//     logger.trace('[uppy addFile stack]');
//     return originalAddFile(file);
//   };

//   window.__vfUppy = uppy;

//   uppy.on('file-added', (file: any) => logger.log('[uppy file-added]', file?.name));
//   uppy.on('files-added', (files: any[]) => logger.log('[uppy files-added]', files?.map(f => f.name)));
//   uppy.on('restriction-failed', (file: any, error: any) =>
//     logger.warn('[uppy restriction-failed]', file?.name, error)
//   );

//   logger.log('[uppy opts]', uppy.opts);
//   logger.log('[uppy restrictions]', uppy.opts?.restrictions);
//   logger.log('[uppy state]', uppy.getState?.());
// };

logger.log('driver setup');
</script>
