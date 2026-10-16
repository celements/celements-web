#!/usr/bin/env sh
set -eu

cache_dir=$(mktemp -d "${TMPDIR:-/tmp}/celements-admin-npm-cache-XXXXXX")
manifest_file=$(mktemp "${TMPDIR:-/tmp}/celements-admin-pack-manifest-XXXXXX.json")
cleanup() {
  rm -rf "$cache_dir"
  rm -f "$manifest_file"
}
trap cleanup EXIT

npm pack --dry-run --json --cache "$cache_dir" > "$manifest_file"
CELEMENTS_PACK_MANIFEST="$manifest_file" npm run test:pack-manifest
