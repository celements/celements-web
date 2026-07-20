export interface AppConfig {
  defaultLocale: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

export const appConfig: Readonly<AppConfig> = {
  defaultLocale: window.__APP_CONFIG__?.defaultLocale || 'de',
};
