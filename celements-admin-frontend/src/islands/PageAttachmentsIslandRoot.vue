<template>
  <div class="cel-admin-surface min-h-[20rem] h-full w-full">
    <PageAttachments
      :space-name="spaceName"
      :doc-name="docName"
      :locale="locale"
      @selection-change="$emit('selectionChange', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import PageAttachments from '@/features/page-attachments/PageAttachments.vue';
import type {
  PageAttachmentsProps,
  PageAttachmentsSelectionDetail,
} from '@/features/page-attachments/types';

defineProps<PageAttachmentsProps>();
defineEmits<{
  selectionChange: [detail: PageAttachmentsSelectionDetail];
}>();
</script>
