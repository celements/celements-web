<template>
  <PageAttachments :space-name="spaceName" :doc-name="docName" />
</template>

<script setup lang="ts">
import PageAttachments from '@/features/page-attachments/PageAttachments.vue';

defineProps<{
  spaceName: string;
  docName: string;
}>();
</script>
