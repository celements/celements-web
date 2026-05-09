import { AuthService, createAuthService } from '@/core/services/auth/auth-service';
import type { AuthOptions } from '@/core/services/auth/types';
import type { AuthState } from '@/core/types/auth';
import { useLogger } from '@/utils/logger';
import type { Store } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';

const logger = useLogger('AuthPlugin');

// Get keycloak specific data from env
const appBaseUrl = import.meta.env.VITE_APP_BASE_URL;
const authBaseUrl = import.meta.env.VITE_KEYCLOAK_BASE_URL;
const realm = import.meta.env.VITE_KEYCLOAK_REALM;
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
const clientSecret = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET;

const createAuthPlugin = (router: Router, authStore: Store<'auth', AuthState>) => {
  const options: AuthOptions = {
    appBaseUrl: appBaseUrl,
    authBaseUrl: authBaseUrl,
    realm: realm,
    clientId: clientId,
    clientSecret: clientSecret,
  };
  const service: AuthService = createAuthService(router, authStore, options);
  return {
    service,
    install(app: App) {
      app.config.globalProperties.$auth = this;
      logger.debug('install', service);
    },
  };
};

export { createAuthPlugin };
