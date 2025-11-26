#!/bin/bash

CATALINA_XMX="${CATALINA_XMX:-2g}"
CATALINA_OPTS="${CATALINA_OPTS}\
 -server\
 -Xms${CATALINA_XMS:-${CATALINA_XMX}}\
 -Xmx${CATALINA_XMX}\
 -Xss1m\
 -XX:+UseShenandoahGC\
 -XX:+UseStringDeduplication\
 -Djava.awt.headless=true\
 -Dorg.apache.activeio.journal.active.DisableLocking=true\
 -Dfile.encoding=UTF-8\
 -Djava.net.preferIPv4Stack=true\
 -Djava.net.preferIPv4Addresses\
"

if [ -n "$IP_ADDR" ]; then
CATALINA_OPTS="${CATALINA_OPTS}\
 -Djgroups.bind_addr=${IP_ADDR}\
"
fi
