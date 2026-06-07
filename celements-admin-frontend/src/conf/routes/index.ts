import MediaLib from '@/views/MediaLib.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/MediaLib',
    name: 'MediaLib',
    component: MediaLib,
    meta: {
      //      requiresAuth: true,
    },
  },
];

export default routes;
