#!/bin/sh
set -euo pipefail

escape_js_string() {
  printf '%s' "$1" | sed \
    -e 's/\\/\\\\/g' \
    -e "s/'/\\\\'/g"
}

cat > /srv/admin/config.js <<EOF
window.__APP_CONFIG__ = {
  defaultLocale: '$(escape_js_string "${DEFAULT_LOCALE:-de}")'
};
EOF

exec "$@"
