<template>
  <div>
    <VueFinder
      id="my_vuefinder"
      :driver="driver"
      :config="{
        initialPath: 'local://public',
        persist: true,
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
