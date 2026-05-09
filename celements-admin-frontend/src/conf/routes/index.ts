import Home from '@/views/Home.vue';
import MediaLib from '@/views/MediaLib.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Willkommen',
//      requiresAuth: true,
    },
  },
  {
    path: '/MediaLib',
    name: 'MediaLib',
    component: MediaLib,
    meta: {
//      requiresAuth: true,
    }
  }
];

export default routes;
