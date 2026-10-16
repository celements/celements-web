const ADMIN_STYLES = [
  ['celements-admin-vendor-styles', 'vendor.css'],
  ['celements-admin-application-styles', 'embedded.css'],
] as const;

export const ensureCelementsAdminStyles = (
  baseUrl: string | URL = import.meta.url,
  production = import.meta.env.VITE_CELEMENTS_DEPLOYABLE === 'true'
) => {
  if (!production) return;
  for (const [id, filename] of ADMIN_STYLES) {
    const isLoaded = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    ).some(({ href }) => new URL(href, document.baseURI).pathname.endsWith(`/${filename}`));
    if (document.getElementById(id) || isLoaded) continue;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL(filename, baseUrl).href;
    document.head.append(link);
  }
};
