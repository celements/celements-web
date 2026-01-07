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
    />
  </div>
</template>

<script lang="ts" setup>
import { useLogger } from '@/utils/logger';
import { RemoteDriver } from 'vuefinder';

const logger=useLogger("VueFinder");

const driver = new RemoteDriver({
  baseURL: '/api/files',
});

logger.log('driver setup');
</script>
