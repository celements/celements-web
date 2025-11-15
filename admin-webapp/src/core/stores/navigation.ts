import router from '@/plugins/plugin.router';
import { useLogger } from '@/utils/logger';
import { defineStore } from 'pinia';
import { computed } from 'vue';

export const useNavigationStore = defineStore('navigation', () => {
  const logger = useLogger('navigationStore');

  const navItems = computed(() => {
    logger.debug('original routes: ', router.getRoutes());
    return router.getRoutes().filter((route) => route.meta.menuname !== undefined);
  });

  return {
    navItems,
  };
});
