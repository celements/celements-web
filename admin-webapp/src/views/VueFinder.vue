<template>
  <vue-finder
    id="basic_example"
    :driver="driver"
    :config="{
      initialPath: 'local://',
      persist: true,
    }"
  />
</template>

<script lang="ts" setup>
import { RemoteDriver } from 'vuefinder';

const driver = new RemoteDriver({
  baseURL: 'https://vuefinder-api.ozdemir.be/api/files',
});
</script>
