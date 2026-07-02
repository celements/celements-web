# syntax=docker/dockerfile:1

FROM maven:3-eclipse-temurin-21 AS build

WORKDIR /app

ARG MVN_CACHE_KEY=none

COPY . .
RUN --mount=type=secret,id=mvnsettings,required=true,target=/root/.m2/settings.xml \
  --mount=type=cache,id=mvnrepo,target=/root/.m2/repository,sharing=locked \
  echo "MVN_CACHE_KEY: ${MVN_CACHE_KEY}" && \
  mvn -B -U \
    -s /root/.m2/settings.xml \
    -Dmaven.repo.local=/root/.m2/repository \
    clean prepare-package war:exploded

FROM ghcr.io/synventis-infra/tomcat:release AS execute

ARG VERSION
ARG REVISION

LABEL org.opencontainers.image.source="https://github.com/celements/celements-web" \
  org.opencontainers.image.description="Celements web application" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.revision="${REVISION}"

COPY --from=build /app/target/celements-web/ "${CATALINA_HOME}/webapps/ROOT/"
