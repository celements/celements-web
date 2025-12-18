import Home from '@/views/Home.vue';
import VueFinder from '@/views/VueFinder.vue';
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
    path: '/VueFinder',
    name: 'VueFinder',
    component: VueFinder,
    meta: {
//      requiresAuth: true,
    }
  }
];

export default routes;
