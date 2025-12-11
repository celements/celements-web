<template>
  <RouterView/>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth';
import { storeToRefs } from 'pinia';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
const { sessionUser } = storeToRefs(authStore);

const toastPT = {
  summary: {
    class: 'font-futuraMedium text-lg',
  },
  detail: {
    class: 'font-futuraBook text-base text-schwarz-100',
  },
};
</script>

<style>
#app img {
  overflow-clip-margin: unset; /* makes images on Chrome crisper and less pixelated https://stackoverflow.com/questions/74502978/object-fit-cover-gives-pixelated-images-on-chrome */
}
</style>
