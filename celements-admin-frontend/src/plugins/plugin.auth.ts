import { appConfig } from '@/conf/app';
import { AuthService, createAuthService } from '@/core/services/auth/auth-service';
import type { AuthOptions } from '@/core/services/auth/types';
import type { AuthState } from '@/core/types/auth';
import { useLogger } from '@/utils/logger';
import type { Store } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';

const logger = useLogger('AuthPlugin');

// Get keycloak specific data from config
const appBaseUrl = appConfig.appBaseUrl;
const authBaseUrl = appConfig.keycloakBaseUrl;
const realm = appConfig.keycloakRealm;
const clientId = appConfig.keycloakClientId;
const clientSecret = appConfig.keycloakClientSecret;

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
