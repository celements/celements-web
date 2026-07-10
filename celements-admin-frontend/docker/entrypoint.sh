#!/bin/sh
set -eu

escape_js_string() {
  printf '%s' "$1" | sed \
    -e 's/\\/\\\\/g' \
    -e "s/'/\\\\'/g"
}

cat > /srv/config.js <<EOF
window.__APP_CONFIG__ = {
  appBaseUrl: '$(escape_js_string "${APP_BASE_URL}")',
  keycloakBaseUrl: '$(escape_js_string "${KEYCLOAK_BASE_URL}")',
  keycloakRealm: '$(escape_js_string "${KEYCLOAK_REALM}")',
  keycloakClientId: '$(escape_js_string "${KEYCLOAK_CLIENT_ID}")',
  keycloakClientSecret: '$(escape_js_string "${KEYCLOAK_CLIENT_SECRET}")',
  defaultLocale: '$(escape_js_string "${DEFAULT_LOCALE:-de}")',
  enableLocalDevelopment: ${ENABLE_LOCAL_DEVELOPMENT:-false}
};
EOF

exec "$@"
