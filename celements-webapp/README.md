# Celements Webapp

`celements-webapp` is the WAR application deployed into Tomcat.

## Local Development

Log in to GHCR once so Docker can pull shared images Use your GitHub username and a classic token
(https://github.com/settings/tokens) with `read:packages` scope as the password.

```sh
docker login ghcr.io
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

Start the sqlserver first, then the rest:

```sh
docker compose up -d sqlserver
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

The image is published by `Jenkinsfile`.

The pipeline extracts the Maven project version from `pom.xml` and publishes:

- `ghcr.io/celements/celements-webapp:<version>`
- `ghcr.io/celements/celements-webapp:<version>-<git-sha>`
