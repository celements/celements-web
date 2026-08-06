<template>
  <div class="flex h-full w-full overflow-hidden">
    <div class="flex min-w-0 flex-1 flex-col w-full">
      <VueFinder
        :id="finderId"
        :key="documentKey"
        class="flex-1"
        :driver="driver"
        :locale="locale"
        :config="{
          initialPath: `attachments://${spaceName}/${docName}`,
          persist: false,
        }"
        :features="features"
        @select="handleSelect"
      >
        <template #status-bar="{ path, count, selected }">
          <slot
            name="attachment-actions"
            :document="document"
            :path="path"
            :count="count"
            :selected-attachments="selected ?? []"
          />
        </template>
      </VueFinder>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  PageAttachmentsActionContext,
  PageAttachmentsDocument,
  PageAttachmentsProps,
  PageAttachmentsSelectionDetail,
} from './types';
import { useLogger } from '@/utils/logger';
import { computed, ref } from 'vue';
import { RemoteDriver, VueFinder, type DirEntry, type FeaturesConfig } from 'vuefinder';

const props = defineProps<PageAttachmentsProps>();
const emit = defineEmits<{
  selectionChange: [detail: PageAttachmentsSelectionDetail];
}>();
defineSlots<{
  'attachment-actions'(props: PageAttachmentsActionContext): unknown;
}>();

const logger = useLogger('VueFinder-Attachments');
const instanceId = ref(`page_attachments_${crypto.randomUUID()}`);
const finderId = computed(() => instanceId.value);
const document = computed<PageAttachmentsDocument>(() => ({
  spaceName: props.spaceName,
  docName: props.docName,
}));
const documentKey = computed(() => `${props.spaceName}/${props.docName}`);
const features: FeaturesConfig = {
  search: true,
  preview: true,
  rename: false,
  upload: true,
  delete: true,
  download: true,
  newfolder: false,
  newfile: false,
  move: false,
  copy: false,
  archive: false,
  unarchive: false,
  edit: false,
  fullscreen: false,
  language: false,
  history: false,
  theme: false,
  pinned: false,
};
const driver = computed(() => {
  const remoteDriver = new RemoteDriver({
    baseURL: `/api/attachments/${encodeURIComponent(props.spaceName)}/${encodeURIComponent(props.docName)}`,
  });
  const originalGetDownloadUrl = remoteDriver.getDownloadUrl.bind(remoteDriver);
  remoteDriver.getDownloadUrl = (file: DirEntry & { url?: string }) =>
    file?.url ?? originalGetDownloadUrl(file);
  return remoteDriver;
});

const handleSelect = (selectedAttachments: DirEntry[]) => {
  const detail = { document: document.value, selectedAttachments };
  logger.log('selected files', selectedAttachments);
  emit('selectionChange', detail);
};

logger.log('driver setup for page attachments');
</script>
