#!/bin/bash
set -euo pipefail

: "${CATALINA_HOME:?CATALINA_HOME not set}"
: "${CONF_DIR:?CONF_DIR not set}"
: "${NODE_NAME:?NODE_NAME not set}"

echo "**entrypoint** applying server.xml"
envsubst \
  < "${CONF_DIR}/server.template.xml" \
  > "${CATALINA_HOME}/conf/server.xml"

echo "**entrypoint** executing: $*"
exec "$@"
