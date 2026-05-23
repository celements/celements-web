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
    meta: {
      //      requiresAuth: true,
    },
  },
  {
    path: '/PageAttachments/:spaceName/:docName',
    name: 'PageAttachments',
    component: PageAttachments,
    meta: {
      //      requiresAuth: true,
    },
  },
];

export default routes;
