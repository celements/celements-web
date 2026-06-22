export interface AppConfig {
  appBaseUrl: string;
  keycloakBaseUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakClientSecret: string;
  defaultLocale: string;
  enableLocalDevelopment: boolean;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

export const appConfig: Readonly<AppConfig> = {
  appBaseUrl: window.__APP_CONFIG__?.appBaseUrl || (import.meta.env.VITE_APP_BASE_URL as string) || '',
  keycloakBaseUrl: window.__APP_CONFIG__?.keycloakBaseUrl || (import.meta.env.VITE_KEYCLOAK_BASE_URL as string) || '',
  keycloakRealm: window.__APP_CONFIG__?.keycloakRealm || (import.meta.env.VITE_KEYCLOAK_REALM as string) || '',
  keycloakClientId: window.__APP_CONFIG__?.keycloakClientId || (import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string) || '',
  keycloakClientSecret: window.__APP_CONFIG__?.keycloakClientSecret || (import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET as string) || '',
  defaultLocale: window.__APP_CONFIG__?.defaultLocale || (import.meta.env.VITE_DEFAULT_LOCALE as string) || 'de',
  enableLocalDevelopment: window.__APP_CONFIG__?.enableLocalDevelopment !== undefined
    ? window.__APP_CONFIG__.enableLocalDevelopment
    : (import.meta.env.VITE_ENABLE_LOCAL_DEVELOPMENT ?? 'true') === 'true',
};
