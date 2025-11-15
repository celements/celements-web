import HomeView from '@/views/HomeView.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Helvetia Alumni - Willkommen',
      requiresAuth: true,
      menuname: 'common.home',
    },
  },
  {
    path: '/news',
    name: 'news',
    component: HomeView,
    meta: {
      requiresAuth: true,
      menuname: 'common.news',
      anchor: '#news',
    },
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventsView.vue'),
    meta: {
      title: 'Helvetia Alumni - Events',
      requiresAuth: true,
    },
  },
  /*{
    path: '/events/:id',
    name: 'event detail',
    component: () => import('@/views/EventDetailView.vue'),
    meta: {
      title: 'Helvetia Alumni - Event Info',
      requiresAuth: true,
    },
  },*/
  {
    path: '/allBenefits',
    name: 'allBenefits',
    component: () => import('@/views/BenefitsView.vue'),
    meta: {
      title: 'Helvetia Alumni - Benefits',
      requiresAuth: true,
    },
  },
  {
    path: '/benefits',
    name: 'benefits',
    component: HomeView,
    meta: {
      title: 'Helvetia Alumni - Benefits',
      requiresAuth: true,
      menuname: 'common.benefits',
      anchor: '#benefits',
    },
  },
  {
    path: '/career',
    name: 'career',
    component: HomeView,
    meta: {
      title: 'Helvetia Alumni - Karriere',
      requiresAuth: true,
      menuname: 'common.career',
      anchor: '#career',
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: HomeView,
    meta: {
      title: 'Helvetia Alumni - Kontakt',
      requiresAuth: true,
      menuname: 'common.contact',
      anchor: '#contact',
    },
  },
  /*{
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/ArchiveView.vue'),
    meta: {
      title: 'Helvetia Alumni - Archiv',
      requiresAuth: true,
      menuname: 'common.archive',
    },
  },*/
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'Helvetia Alumni - Dein Profil',
      requiresAuth: true,
    },
  },
  {
    path: '/registration',
    name: 'registration',
    component: () => import('@/views/RegistrationView.vue'),
    meta: {
      title: 'Helvetia Alumni - Registrierung',
      requiresAuth: false,
    },
  },
  {
    path: '/sendActivation/:orgId',
    name: 'sendActivation',
    component: () => import('@/views/SendActivationView.vue'),
    meta: {
      title: 'Helvetia Alumni - Aktivierung',
      requiresAuth: false,
    },
  },
  {
    path: '/profileDeleted',
    name: 'profileDeleted',
    component: () => import('@/views/ProfileDeletedView.vue'),
    meta: {
      title: 'Helvetia Alumni - Profil gelöscht',
      requiresAuth: false,
    },
  },
];

export default routes;
