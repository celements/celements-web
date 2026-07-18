<template>
  <ConfirmDialog />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';
</script>
