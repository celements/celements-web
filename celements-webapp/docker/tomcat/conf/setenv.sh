#!/bin/bash

# CATALINA_XMX=1200m
## TODO Cgroup-aware memory detection for container environments
if [ -z "$CATALINA_XMX" ]; then
  total_memory_kb=$(grep -i 'memtotal' /proc/meminfo | grep -o '[[:digit:]]*')
  xmx_kb=$((total_memory_kb * 80 / 100)) # use 80% of memory
  xmx_kb_max=$((total_memory_kb - 716800)) # make sure at least 700m left
  [ $xmx_kb -gt $xmx_kb_max ] && xmx_kb=$xmx_kb_max
  xmx_kb_min=$((1024 * 1024)) # minimum 1GB heap
  [ $xmx_kb -lt $xmx_kb_min ] && echo "ERROR: at least 1GB heap required" >&2 && exit 1
  CATALINA_XMX="$((xmx_kb / 1024))m"
fi

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
"

if [ -n "$GC_LOG_VERBOSE" ]; then
CATALINA_OPTS="${CATALINA_OPTS}\
  -Xlog:gc*,safepoint:file=${CATALINA_HOME}/logs/gc.log:time,uptime,level,tags:filecount=5,filesize=10M\
  -Xlog:class+unload=trace\
  -Xlog:stringdedup*=debug\
"
fi
