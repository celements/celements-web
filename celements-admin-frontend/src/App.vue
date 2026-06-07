<template>
  <ConfirmDialog />
  <RouterView/>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth';
import { RouterView } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';

 useAuthStore();
</script>
