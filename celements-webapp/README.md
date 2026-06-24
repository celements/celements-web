# Celements Webapp

`celements-webapp` is the WAR application deployed into Tomcat.

## Local Development

Create the local runtime configuration:

```sh
cp sample.env .env && vim .env
```

Build the exploded WAR for the local mounted-webapp setup:

```sh
mvn clean install -P local
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
`target/celements-web.war` copied into `webapps/ROOT.war`.

## Image builds

The image is published by `Jenkinsfile`.

The pipeline extracts the Maven project version from `pom.xml` and publishes:

- `ghcr.io/celements/celements-webapp:<version>`
- `ghcr.io/celements/celements-webapp:<version>-<git-sha>`
