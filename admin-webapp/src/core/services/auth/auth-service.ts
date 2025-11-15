import type { AuthOptions } from '@/core/services/auth/types';
import { VueUserState } from '@/core/services/auth/vue-user-state';
import type { AuthState } from '@/core/types/auth';
import type { Logger } from '@/core/types/logger';
import { useLogger } from '@/utils/logger';
import { isNil, split } from 'lodash';
import type { SignoutRedirectArgs, UserManagerSettings } from 'oidc-client-ts';
import { User, UserManager } from 'oidc-client-ts';
import type { Store } from 'pinia';
import { h } from 'vue';
import type { RouteLocationNormalized, Router } from 'vue-router';

export type OnAuthenticated =
  | (() => void)
  | (() => Promise<void>)
  | ((user: User) => void)
  | ((user: User) => Promise<void>);

export class AuthService {
  #manager: UserManager;
  #router: Router;
  #store: Store<'auth', AuthState>;
  #config: UserManagerSettings;
  #log: Logger;
  #onAuthenticated: OnAuthenticated[];

  constructor(router: Router, authStore: Store<'auth', AuthState>, options: AuthOptions) {
    const openIdcSettings: UserManagerSettings = {
      authority: `${options.authBaseUrl}/realms/${options.realm}`,
      client_id: options.clientId,
      redirect_uri: `${options.appBaseUrl}/sign-in-callback`,
      silent_redirect_uri: `${options.appBaseUrl}/silent-sign-in-callback`,
      post_logout_redirect_uri: `${options.appBaseUrl}/`,
      response_type: 'code',
      scope: 'openid profile email alumni_roles',
    };
    this.#manager = new UserManager(openIdcSettings);
    this.#config = openIdcSettings;
    this.#router = router;
    this.#store = authStore;
    this.#log = useLogger('AuthService');
    this.registerUserManagerEvents();
    this.registerRouterGuards();
    this.registerRouterCallbackRoutes();
    this.loadSessionUserIfAlreadyAuthenticated();
    this.#log.info('AuthService constructed');
    this.#log.info('Settings: ', openIdcSettings);
    this.#onAuthenticated = [];
  }

  private registerRouterGuards() {
    this.#router.beforeEach(async (to, from) => {
      if (to.matched.some((record) => record.meta.requiresAuth === true)) {
        this.#log.info('route requires auth, checking route: ', from.fullPath, ' -> ', to.fullPath);
        if (await this.isAuthenticated()) {
          this.#log.info('already authenticated');
        } else {
          this.#log.info('start authentication', this.#router.getRoutes());
          await this.login(to);
        }
      } else {
        this.#log.info('route has no auth req, route:', to);
      }
    });
  }

  private registerRouterCallbackRoutes() {
    const callbackPath = new URL(this.#config.redirect_uri).pathname;
    this.#log.info('Register callback path: ', callbackPath);
    this.#router.addRoute({
      path: callbackPath,
      component: {
        render: () => h('div'),
      },
      beforeEnter: async (to) => {
        this.#log.info('sign-in-callback entered');
        let targetRoute: RouteLocationNormalized | string = '/';
        try {
          const data = await this.#manager.signinRedirectCallback(to.fullPath);
          const state: VueUserState = data.state as VueUserState;
          targetRoute = state.current || '/';
        } catch (e) {
          const error: Error = e as Error;
          if (error.message !== 'No matching state found in storage') {
            this.#log.error('Error signing in: ', error);
            throw error;
          }
        }
        await this.#router.replace(targetRoute);
      },
    });
  }

  private registerUserManagerEvents() {
    this.#log.info('Register user manager events');
    this.#manager.events.addUserLoaded(async (user: User) => {
      this.#log.info('OIDC[Event] User loaded: ', user);
      this.loadSessionUser(user);
      await Promise.all(
        this.#onAuthenticated.map(async (callback) => {
          await callback(user);
        })
      );
    });
    this.#manager.events.addUserUnloaded(async () => {
      this.#log.info('OIDC[Event] User unloaded');
      this.unloadSessionUser();
    });
    this.#manager.events.addAccessTokenExpiring(async () => {
      this.#log.info('OIDC[Event] Access token expiring');
    });
    this.#manager.events.addAccessTokenExpired(async () => {
      this.#log.info('OIDC[Event] Access token expired');
    });
    this.#manager.events.addSilentRenewError(async (error) => {
      this.#log.info('OIDC[Event] Silent renew error: ', error);
    });
    this.#manager.events.addUserSignedOut(async () => {
      this.#log.info('OIDC[Event] User signed out');
    });
  }

  private loadSessionUser(user: User) {
    this.#store.sessionUser = {
      userId: user.profile.sub,
      idToken: user.id_token,
      accessToken: user.access_token,
      scopes: split(user.scope, ' '),
      expiresAt: user.expires_at,
      issuedAt: user.profile.iat,
      issuer: user.profile.iss,
      email: user.profile.email,
      lastName: user.profile.family_name,
      firstName: user.profile.given_name,
      username: user.profile.preferred_username,
      isAdmin: Array.isArray(user.profile.alumniRoles)
        ? user.profile.alumniRoles.includes('alumni-admin')
        : false,
    };
  }

  private unloadSessionUser() {
    this.#store.sessionUser = null;
  }

  private loadSessionUserIfAlreadyAuthenticated() {
    // in case there's still a valid session, load the user into pinia store
    this.#manager.getUser().then((user: User | null) => {
      if (!isNil(user) && !user.expired) {
        this.loadSessionUser(user);
      }
    });
  }

  public registerOnAuthenticated(callback: OnAuthenticated) {
    this.#onAuthenticated.push(callback);
  }

  public async isAuthenticated(): Promise<boolean> {
    const user = await this.#manager.getUser();
    return !isNil(user) && !user.expired;
  }

  public async getUser(): Promise<User | null> {
    return await this.#manager.getUser();
  }

  public async login(to?: RouteLocationNormalized): Promise<void> {
    const current = this.#router.currentRoute.value;
    await this.#manager.signinRedirect({ state: { current, to } });
  }

  public renewToken(): Promise<User | null> {
    return this.#manager.signinSilent();
  }

  public logout(options?: SignoutRedirectArgs): Promise<void> {
    if (options) {
      return this.#manager.signoutRedirect(options);
    } else {
      return this.#manager.signoutRedirect();
    }
  }
}

let authService: AuthService | null = null;

const createAuthService = (
  router: Router,
  authStore: Store<'auth', AuthState>,
  options: AuthOptions
) => {
  if (authService === null) {
    authService = new AuthService(router, authStore, options);
  }
  return authService;
};

const useAuthService = () => {
  return authService;
};

const onAuthenticated = (callback: OnAuthenticated) => {
  if (authService) {
    authService.registerOnAuthenticated(callback);
  } else {
    throw new Error('AuthService not initialized');
  }
};

export { createAuthService, useAuthService, onAuthenticated };
