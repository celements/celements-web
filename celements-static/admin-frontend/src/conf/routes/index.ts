import MediaLib from '@/views/MediaLib.vue';
import PageAttachmentsRoute from '@/spa/PageAttachmentsRoute.vue';
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
    component: PageAttachmentsRoute,
    props: (route) => ({
      spaceName: String(route.params.spaceName),
      docName: String(route.params.docName),
    }),
  },
];

export default routes;
