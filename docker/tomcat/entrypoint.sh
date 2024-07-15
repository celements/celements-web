#!/bin/bash
set -euo pipefail

echo "** installing hibernate.cfg.xml"
envsubst < /usr/local/config/hibernate.cfg.xml \
  > ${CATALINA_HOME}/webapps/ROOT/WEB-INF/hibernate.cfg.xml

# TODO xwiki.cfg - idea: custom envlocal profile in pom file 
# with variables defined in local env file and being replaced here via envsubst

echo "** installing log4j2.properties"
envsubst < /usr/local/config/log4j2.properties \
  > ${CATALINA_HOME}/webapps/ROOT/WEB-INF/classes/log4j2.properties

exec "$@"
