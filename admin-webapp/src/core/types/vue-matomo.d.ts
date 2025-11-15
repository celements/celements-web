/* typing done with Copilot according to https://github.com/AmazingDreams/vue-matomo and https://developer.matomo.org/api-reference/tracking-javascript */
declare module 'vue-matomo' {
  import { Plugin, App } from 'vue';
  import { Router } from 'vue-router';

  export interface MatomoOptions {
    /**
     * URL des Matomo-Servers (ohne 'http://' oder 'https://')
     */
    host: string;

    /**
     * Website-ID in Matomo
     */
    siteId: string | number;

    /**
     * Instanz des Vue-Routers für automatisches Seiten-Tracking
     */
    router?: Router;

    /**
     * Pfad zur matomo.js oder matomo.php Datei (Standard: 'matomo.php')
     */
    trackerFileName?: string;

    /**
     * Pfad zur matomo.js Datei (Standard: 'matomo.js')
     */
    trackerJsFile?: string;

    /**
     * Aktiviert das Tracking von Link-Klicks
     * @default true
     */
    enableLinkTracking?: boolean;

    /**
     * Erfordert Zustimmung bevor Tracking startet
     * @default false
     */
    requireConsent?: boolean;

    /**
     * Ob die initiale Seite getrackt werden soll
     * @default true
     */
    trackInitialView?: boolean;

    /**
     * Deaktiviert Cookies
     * @default false
     */
    disableCookies?: boolean;

    /**
     * Aktiviert den Heartbeat-Timer für genauere Besuchszeitmessung
     * @default false
     */
    enableHeartBeatTimer?: boolean;

    /**
     * Intervall für den Heartbeat-Timer in Sekunden
     * @default 15
     */
    heartBeatTimerInterval?: number;

    /**
     * Aktiviert Debug-Modus
     * @default false
     */
    debug?: boolean;

    /**
     * Setzt die User-ID für das Besucher-Tracking
     */
    userId?: string;

    /**
     * Die Cookie-Domain
     */
    cookieDomain?: string;

    /**
     * Array von Domains, die getrackt werden sollen
     */
    domains?: string[];

    /**
     * Aktionen, die vor der Initialisierung ausgeführt werden sollen
     */
    preInitActions?: Array<(_paq: Array<(string | number | boolean | unknown)[]>) => void>;
  }

  export interface MatomoInstance {
    /**
     * Trackt ein Event
     */
    trackEvent: (category: string, action: string, name?: string, value?: number) => void;

    /**
     * Trackt einen Seitenaufruf
     */
    trackPageView: (customTitle?: string) => void;

    /**
     * Trackt ein Ziel/Conversion
     */
    trackGoal: (goalId: number | string, conversionValue?: number) => void;

    /**
     * Trackt einen Link-Klick
     */
    trackLink: (url: string, linkType: string) => void;

    /**
     * Trackt eine Seitensuche
     */
    trackSiteSearch: (keyword: string, category?: string, resultsCount?: number) => void;

    /**
     * Setzt die User-ID für das Besucher-Tracking
     */
    setUserId: (userId: string) => void;

    /**
     * Setzt die User-ID zurück
     */
    resetUserId: () => void;

    /**
     * Setzt den Seitentitel
     */
    setDocumentTitle: (title: string) => void;

    /**
     * Setzt eine benutzerdefinierte Variable
     */
    setCustomVariable: (index: number, name: string, value: string, scope?: string) => void;

    /**
     * Löscht eine benutzerdefinierte Variable
     */
    deleteCustomVariable: (index: number, scope?: string) => void;

    /**
     * Setzt eine benutzerdefinierte Dimension
     */
    setCustomDimension: (customDimensionId: number, customDimensionValue: string) => void;

    /**
     * Löscht eine benutzerdefinierte Dimension
     */
    deleteCustomDimension: (customDimensionId: number) => void;

    /**
     * Fordert Zustimmung für das Tracking an
     */
    requireConsent: () => void;

    /**
     * Gibt Zustimmung für das Tracking
     */
    setConsentGiven: () => void;

    /**
     * Widerruft die Zustimmung für das Tracking
     */
    rememberConsentGiven: () => void;

    /**
     * Widerruft die Zustimmung für das Tracking
     */
    forgetConsentGiven: () => void;

    /**
     * Prüft, ob Consent gegeben wurde
     */
    hasConsent: () => boolean;
  }

  export interface MatomoPlugin extends Plugin {
    /**
     * Installiert das Matomo-Plugin in einer Vue-Anwendung
     */
    install: (app: App, options: MatomoOptions) => void;
  }

  const VueMatomo: MatomoPlugin;

  export default VueMatomo;
}
