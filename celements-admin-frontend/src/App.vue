<template>
  <div class="cel-admin-surface h-full w-full">
    <ConfirmDialog />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';
</script>
