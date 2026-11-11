# Celements Webapp

`celements-webapp` is the WAR application deployed into Tomcat.

## Local Development

Log in to the forge once so Docker can pull shared images. Generate an access token
(https://forge.celhosting.ch/user/settings/applications) with `package: Read` permission.

```sh
docker login forge.celhosting.ch
```

Go to your git celements-web/celements-webapp folder (or clone celements-web if not yet done). The following commands sould be run in that folder.
```sh
cd celements-web/celements-webapp
```

Create the local runtime configuration:

```sh
cp .env.sample .env.local && vim .env.local
```

`.env.tomcat` derives the Tomcat runtime configuration from those local DB values.

Build the exploded WAR for the local mounted-webapp setup:

```sh
mvn clean install
```

Start the containers:

```sh
docker compose up -d
```

Open `http://localhost:2080`.

For remote development, forward the Tomcat port:

```sh
ssh -N -L 2080:localhost:2080 myremotehost
```

## Local Image Builds

Local image builds use `compose.build.yml`. The build requires an untracked `mvn-settings.xml` in
this directory with access to private Maven artifacts.

```sh
docker compose -f compose.build.yml build
```

This builds the same image shape as Jenkins: Maven build stage, Tomcat runtime stage, and
the exploded `target/celements-web/` webapp copied into `webapps/ROOT/`.

## Image builds

The image is published by `Jenkinsfile.image`.

The pipeline extracts the Maven project version from `pom.xml` and publishes:

- `forge.celhosting.ch/celements/celements-webapp:<version>`
- `forge.celhosting.ch/celements/celements-webapp:<version>-<git-sha>`

## Shared Commands

Install/symlink the shared commands in your path (e.g. `/usr/local/bin`) and run from `celements-webapp`:

```sh
sudo ln -s synventis-tools/webapp/up.sh /usr/local/bin/webapp-up
sudo ln -s synventis-tools/webapp/mysql.sh /usr/local/bin/webapp-mysql
```

### webapp-up

Builds the exploded WAR, starts Compose and watches backend/frontend sources.

```sh
webapp-up
webapp-up --mvn-startup="-U install"
```

### webapp-mysql

Root DB access using the container's `MYSQL_ROOT_PASSWORD`; `upgrade` runs `mariadb-upgrade`.

```sh
webapp-mysql
webapp-mysql -e "SHOW DATABASES"
webapp-mysql upgrade
```

## Migrating a Local Database from MariaDB 10.1

Use `synventis-tools/webapp/mysql.sh`, linked as `webapp-mysql`.

Remove all existing containers:

```sh
docker compose down --timeout 300
```

git pull the most recent state and start the db container:

```sh
git switch dev
git pull
docker compose up -d db
docker compose logs -f db
```

Once it reports `ready for connections` run the upgrade command:

```sh
webapp-mysql upgrade
```

Then create the missing healthcheck account and restart:

```sh
webapp-mysql -e "CREATE USER IF NOT EXISTS 'mysql'@'localhost' IDENTIFIED VIA unix_socket;"
docker compose restart db
docker compose up -d --wait
```
