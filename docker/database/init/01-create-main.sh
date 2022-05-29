echo "** Creating ${DB_PREFIX}_main"
mysql -u root -p$MYSQL_ROOT_PASSWORD --execute "
CREATE DATABASE IF NOT EXISTS ${DB_PREFIX}_main;
GRANT all privileges ON \`${DB_PREFIX}\\_%\`.* TO '${DB_USER}'@'%' identified BY '${DB_PASSWORD}';
"
echo "** done"
