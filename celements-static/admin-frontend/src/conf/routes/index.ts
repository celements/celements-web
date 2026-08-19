import MediaLib from '@/views/MediaLib.vue';
import PageAttachments from '@/views/PageAttachments.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/MediaLib',
  },
  {
    path: '/MediaLib',
    name: 'MediaLib',
    component: MediaLib,
  },
  {
    path: '/PageAttachments/:spaceName/:docName',
    name: 'PageAttachments',
    component: PageAttachments,
  },
];

export default routes;
