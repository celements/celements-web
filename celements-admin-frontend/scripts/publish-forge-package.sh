#!/bin/sh

set -eu

registry='https://forge.celhosting.ch/api/packages/celements/npm/'
package_name=$(node -p "require('./package.json').name")
package_version=$(node -p "require('./package.json').version")
dist_tag=${NPM_DIST_TAG:-latest}

case "$package_version" in
  *-SNAPSHOT)
    echo "refusing to publish mutable snapshot version $package_version" >&2
    echo 'set a unique SemVer prerelease version before publishing' >&2
    exit 1
    ;;
esac

if [ -z "${FORGE_TOKEN:-}" ]; then
  echo 'FORGE_TOKEN is required for Forge package publication' >&2
  exit 1
fi

view_error=$(mktemp)
trap 'rm -f "$view_error"' EXIT
if npm view "$package_name@$package_version" version --registry "$registry" >/dev/null 2>"$view_error"; then
  echo "refusing to overwrite published package $package_name@$package_version" >&2
  exit 1
fi
if ! grep -q 'E404' "$view_error"; then
  cat "$view_error" >&2
  exit 1
fi

npm publish --registry "$registry" --tag "$dist_tag"
