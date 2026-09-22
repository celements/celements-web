<template>
  <div class="cel-admin-surface tw:min-h-[20rem] tw:h-full tw:w-full">
    <PageAttachments
      :space-name="spaceName"
      :doc-name="docName"
      :locale="locale"
      :can-upload="canUpload"
      :can-delete="canDelete"
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
