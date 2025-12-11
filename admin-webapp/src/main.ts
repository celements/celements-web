import '@/assets/main.css';

import App from '@/App.vue';
import { useAuthStore } from '@/core/stores/auth';
import { createI18n } from '@/plugins/i18n';
import { createAuthPlugin } from '@/plugins/plugin.auth';
import Store from '@/plugins/plugin.pinia';
import Router from '@/plugins/plugin.router';
import { useLogger } from '@/utils/logger';
import { createApp } from 'vue';

const logger = useLogger('Celements-Admin');

const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
  logger.error(err as string, instance, info);
};

app.use(Store);

// register auth plugin with router and store
const authStore = useAuthStore();
const Auth = createAuthPlugin(Router, authStore);

const locale = import.meta.env.VITE_DEFAULT_LOCALE;

app.use(Router);
app.use(createI18n({ locale }));
app.use(Auth);

const localDev = (import.meta.env.VITE_ENABLE_LOCAL_DEVELOPMENT ?? 'true') === 'true';
app.provide('localDev', localDev);
if (localDev) {
  logger.info('local development enabled');
}

logger.debug('mounting app...');
app.mount('#app');

logger.info('main ready');
