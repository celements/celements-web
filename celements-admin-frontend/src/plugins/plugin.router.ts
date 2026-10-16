import routes from '@/conf/routes';
import { createRouter, createWebHistory } from 'vue-router';

export const createAdminRouter = () => {
  const router = createRouter({
    history: createWebHistory('/app/cel/admin/'),
    routes,
    scrollBehavior(to) {
      const position = to.meta.anchor
        ? { el: to.meta.anchor.toString(), top: 127, behavior: 'smooth' as const }
        : { top: 0, behavior: 'smooth' as const };
      return new Promise((resolve) => {
        setTimeout(() => resolve(position), 50);
      });
    },
  });
  router.beforeEach((to) => {
    document.title =
      typeof to.meta?.title === 'function'
        ? to.meta.title()
        : (to.meta?.title ?? 'Open-Celements Admin');
  });
  return router;
};
