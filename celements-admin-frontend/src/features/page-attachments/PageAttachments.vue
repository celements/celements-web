<template>
  <div class="tw:flex tw:h-full tw:w-full tw:overflow-hidden">
    <div class="tw:flex tw:min-w-0 tw:flex-1 tw:flex-col tw:w-full">
      <VueFinder
        :id="finderId"
        :key="documentKey"
        class="tw:flex-1"
        :driver="driver"
        :locale="locale"
        :config="{
          initialPath: `attachments://${spaceName}/${docName}`,
          persist: false,
        }"
        :features="features"
        :context-menu-items="contextMenuItems"
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
import { navigateTo } from '@/utils/navigation';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  RemoteDriver,
  VueFinder,
  type DirEntry,
  type FeaturesConfig,
  type VueFinderProps,
} from 'vuefinder';

const props = defineProps<PageAttachmentsProps>();
const emit = defineEmits<{
  selectionChange: [detail: PageAttachmentsSelectionDetail];
}>();
defineSlots<{
  'attachment-actions'(props: PageAttachmentsActionContext): unknown;
}>();

const logger = useLogger('VueFinder-Attachments');
const { t } = useI18n();
const finderId = `page_attachments_${crypto.randomUUID()}`;
const document = computed<PageAttachmentsDocument>(() => ({
  spaceName: props.spaceName,
  docName: props.docName,
}));
const documentKey = computed(() => `${props.spaceName}/${props.docName}`);
const features = computed<FeaturesConfig>(() => ({
  search: true,
  preview: true,
  rename: false,
  upload: props.canUpload,
  delete: props.canDelete,
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
}));
const driver = computed(() => {
  const remoteDriver = new RemoteDriver({
    baseURL: `/api/attachments/${encodeURIComponent(props.spaceName)}/${encodeURIComponent(props.docName)}`,
  });
  const originalGetDownloadUrl = remoteDriver.getDownloadUrl.bind(remoteDriver);
  remoteDriver.getDownloadUrl = (file: DirEntry & { url?: string }) =>
    file?.url ?? originalGetDownloadUrl(file);
  return remoteDriver;
});
const contextMenuItems: NonNullable<VueFinderProps['contextMenuItems']> = [
  {
    id: 'celements-revision-history',
    title: () => t('common.pageAttachments.revisionHistory'),
    action: (_app, items) => {
      const historyUrl = (items[0] as DirEntry & { historyUrl?: string })?.historyUrl;
      if (historyUrl) navigateTo(historyUrl);
    },
    show: (_app, { items, target }) =>
      items.length === 1 &&
      target?.type === 'file' &&
      Boolean((target as DirEntry & { historyUrl?: string }).historyUrl),
  },
];

const handleSelect = (selectedAttachments: DirEntry[]) => {
  const detail = { document: document.value, selectedAttachments };
  logger.log('selected files', selectedAttachments);
  emit('selectionChange', detail);
};

logger.log('driver setup for page attachments');
</script>
