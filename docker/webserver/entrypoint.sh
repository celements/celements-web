#!/bin/sh

echo "** installing hibernate.cfg.xml"
envsubst < /usr/local/config/hibernate.cfg.xml \
  > ${CATALINA_HOME}/webapps/ROOT/WEB-INF/hibernate.cfg.xml

# exec CMD
exec "$@"
