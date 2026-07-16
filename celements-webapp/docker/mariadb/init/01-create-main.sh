#!/bin/sh

DB_NAME="${DB_PREFIX}_${DB_MAIN}"
echo "** Creating ${DB_NAME}"
mysql -u root -p$MYSQL_ROOT_PASSWORD --execute "
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
GRANT all privileges ON \`${DB_PREFIX}\\_%\`.* TO '${DB_USER}'@'%' identified BY '${DB_PASSWORD}';"
echo "** done"
