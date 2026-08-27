import routes from '@/conf/routes';
import { useLogger } from '@/utils/logger';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory('/app/cel/admin/'),
  routes,
  scrollBehavior(to) {
    const logger = useLogger('router');
    if (to.meta.anchor) {
      logger.debug('scrollto: ', to.meta.anchor);
      const anchor = to.meta.anchor.toString();
      // Without the Promise, scrolling does not work properly.
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ el: anchor, top: 127, behavior: 'smooth' });
        }, 50);
      });
    } else {
      // Without the Promise, scrolling does not work properly.
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ top: 0, behavior: 'smooth' });
        }, 50);
      });
    }
  },
});
router.beforeEach((to) => {
  document.title =
    typeof to.meta?.title === 'function' ? to.meta.title() : (to.meta?.title ?? 'Open-Celements Admin');
});

export default router;
