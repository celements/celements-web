<template>
  <RouterView/>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth';
import { RouterView } from 'vue-router';

 useAuthStore();
</script>
