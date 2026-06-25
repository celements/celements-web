FROM maven:3-eclipse-temurin-21 AS build

WORKDIR /app

# Layer: dependencies
ARG MVN_CACHE_KEY=none
COPY pom.xml ./
RUN --mount=type=secret,id=mvnsettings,required=true,dst=/root/.m2/settings.xml \
  echo "MVN_CACHE_KEY: ${MVN_CACHE_KEY}" && \
  mvn -B -U dependency:go-offline && \
  find /root/.m2/repository -name "*.lastUpdated" -delete && \
  find /root/.m2/repository -name "_remote.repositories" -delete

# Layer: package
COPY . .
RUN mvn -B clean prepare-package war:exploded

FROM tomcat:10-jdk21-temurin AS execute

ARG VERSION
ARG REVISION

LABEL org.opencontainers.image.source="https://github.com/celements/celements-web" \
  org.opencontainers.image.description="Celements web application" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.revision="${REVISION}"

ENV APP_DATA=/usr/local/celements \
  CONF_DIR=/usr/local/conf

COPY docker/tomcat/entrypoint.sh /usr/local/bin/start
COPY docker/tomcat/conf "${CONF_DIR}"

RUN apt-get update \
  && apt-get --no-install-recommends -y install \
    gettext-base \
  && rm -rf /var/lib/apt/lists/* "${CATALINA_HOME}/webapps/"* \
  && mkdir -p \
    "${APP_DATA}" \
    "${CATALINA_HOME}/temp" \
    "${CATALINA_HOME}/conf/Catalina/localhost" \
  && cp "${CONF_DIR}/setenv.sh" "${CATALINA_HOME}/bin/" \
  && cp "${CONF_DIR}/jakarta.converter.xml" "${CATALINA_HOME}/conf/Catalina/localhost/ROOT.xml" \
  && chmod +x /usr/local/bin/start

COPY --from=build /app/target/celements-web/ "${CATALINA_HOME}/webapps/ROOT/"

EXPOSE 8080 9090

ENTRYPOINT ["start"]
CMD ["catalina.sh", "run"]
