#!/bin/bash

# CATALINA_XMX=1200m
if [ -z "$CATALINA_XMX" ]; then
  total_memory_kb=$(grep -i 'memtotal' /proc/meminfo | grep -o '[[:digit:]]*')
  xmx_kb=$((total_memory_kb * 80 / 100)) # use 80% of memory
  xmx_kb_max=$((total_memory_kb - 716800)) # make sure at least 700m left
  [ $xmx_kb -gt $xmx_kb_max ] && xmx_kb=$xmx_kb_max
  CATALINA_XMX="$((xmx_kb / 1024))m"
fi

CATALINA_OPTS="
-server
-Xms${CATALINA_XMX}
-Xmx${CATALINA_XMX}
-Xss1m
-XX:+UseShenandoahGC
-XX:+UseStringDeduplication
-Djava.awt.headless=true
-Dorg.apache.activeio.journal.active.DisableLocking=true
-Dfile.encoding=UTF-8
-Djava.net.preferIPv4Stack=true
-Djava.net.preferIPv4Addresses
"

if [ -n "$IP_ADDR" ]; then
CATALINA_OPTS="${CATALINA_OPTS}
-Djgroups.bind_addr=${IP_ADDR}
"
fi
