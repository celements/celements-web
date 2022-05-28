#!/bin/sh

echo "SETUP: installing hibernate.cfg.xml"
envsubst < hibernate_template.cfg.xml \
  > ${CATALINA_HOME}/webapps/ROOT/WEB-INF/hibernate.cfg.xml

# exec CMD
exec "$@"
