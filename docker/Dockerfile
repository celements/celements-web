#           _                           _        #
#   ___ ___| | ___ _ __ ___   ___ _ __ | |_ ___  #
#  / __/ _ \ |/ _ \ '_ ` _ \ / _ \ '_ \| __/ __| #
# | (_|  __/ |  __/ | | | | |  __/ | | | |_\__ \ #
#  \___\___|_|\___|_| |_| |_|\___|_| |_|\__|___/ #
#                                                #

# —————————————————————————————————————————————— #
# Stage: build                                   #
# —————————————————————————————————————————————— #
FROM maven:3-openjdk-11-slim AS build
COPY docker/maven/settings.xml /root/.m2/
WORKDIR /usr/local/src
# Layer: dependencies
COPY pom.xml ./
RUN mvn verify clean --fail-never > /dev/null
# Layer: package
COPY src src
COPY babel-jslib babel-jslib
RUN mvn clean compile war:exploded

# —————————————————————————————————————————————— #
# Stage: execute                                 #
# —————————————————————————————————————————————— #
FROM tomcat:9-jdk11-temurin AS execute

# when using docker-compose, these ENV values may be overridden from the .env file
ENV CELEMENTS_DATA=/usr/local/celements
# add tomcat jpda debugging environmental variables
# ENV JPDA_OPTS="-agentlib:jdwp=transport=dt_socket,address=8000,server=y,suspend=n"
ENV JPDA_ADDRESS="8000"
ENV JPDA_TRANSPORT="dt_socket"

# copy configurations / scripts
COPY docker/webserver /usr/local/config
# TODO ENV CATALINA_OPTS="-Dkey=value" working?
# TODO COPY docker/config/xwiki.cfg xwiki_template.cfg

## TODO already set?
# USER tomcat:tomcat

# define custom entrypoint and command (with remote debugging)
ENTRYPOINT ["/usr/local/config/entrypoint.sh"]
CMD ["catalina.sh", "jpda", "run"]

# installs and setup
RUN apt-get update \
 && apt-get --no-install-recommends -y install \
      gettext-base \
 && rm -rf \
      /var/lib/apt/lists/* \
      ${CATALINA_HOME}/webapps/* \
 && mkdir -p \
      ${CELEMENTS_DATA} \
      ${CATALINA_HOME}/temp \
 && cp /usr/local/config/setenv.sh ${CATALINA_HOME}/bin/

# add sources from build stage
COPY --from=build /usr/local/src/target/celements-web ${CATALINA_HOME}/webapps/ROOT
