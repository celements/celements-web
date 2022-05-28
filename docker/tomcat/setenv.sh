#!/bin/bash
CATALINA_OPTS="-server -Xms2g -Xmx2g -Djava.awt.headless=true -Dorg.apache.activeio.journal.active.DisableLocking=true"
CATALINA_OPTS="${CATALINA_OPTS} -Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses -Dfile.encoding=UTF-8"
