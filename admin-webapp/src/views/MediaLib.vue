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
      :custom-uploader="customUploader"
    />
  </div>
</template>

<script lang="ts" setup>
import { useLogger } from '@/utils/logger';
import { RemoteDriver, VueFinder } from 'vuefinder';

const logger=useLogger("VueFinder");

const driver = new RemoteDriver({
  baseURL: '/api/files',
});

const customUploader = (uppy: unknown) => {
  const originalAddFile = uppy.addFile.bind(uppy);

  uppy.addFile = (file: any) => {
    console.log('[uppy addFile called]', file?.name ?? file);
    console.trace('[uppy addFile stack]');
    return originalAddFile(file);
  };

  window.__vfUppy = uppy;

  uppy.on('file-added', (file: unknown) => console.log('[uppy file-added]', file?.name));
  uppy.on('files-added', (files: unknown[]) => console.log('[uppy files-added]', files?.map(f => f.name)));
  uppy.on('restriction-failed', (file: unknown, error: unknown) =>
    console.warn('[uppy restriction-failed]', file?.name, error)
  );

  console.log('[uppy opts]', uppy.opts);
  console.log('[uppy restrictions]', uppy.opts?.restrictions);
  console.log('[uppy state]', uppy.getState?.());
};

logger.log('driver setup');
</script>
