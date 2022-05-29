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
RUN mvn clean compile war:exploded | grep -v 'Downloading'

# —————————————————————————————————————————————— #
# Stage: execute                                 #
# —————————————————————————————————————————————— #
FROM tomcat:8-jdk11-openjdk AS execute

# when using docker-compose, these ENV values may be overridden from the .env file
ENV CELEMENTS_DATA=/usr/local/celements
# add tomcat jpda debugging environmental variables
# ENV JPDA_OPTS="-agentlib:jdwp=transport=dt_socket,address=8000,server=y,suspend=n"
ENV JPDA_ADDRESS="8000"
ENV JPDA_TRANSPORT="dt_socket"

# install tools and JDBC connector
RUN apt-get update \
 && apt-get --no-install-recommends -y install \
      gettext-base \
      libmariadb-java \
 && rm -rf /var/lib/apt/lists/*

# copy configurations / scripts
# TODO ENV CATALINA_OPTS="-Dkey=value" working?
COPY docker/tomcat/setenv.sh ${CATALINA_HOME}/bin/
COPY docker/config/hibernate.cfg.xml hibernate_template.cfg.xml
# TODO COPY docker/config/xwiki.cfg xwiki_template.cfg
COPY docker/entrypoint.sh /entrypoint.sh

# Create required dirs and copy the JDBC driver in the Tomcat lib
RUN mkdir -p ${CELEMENTS_DATA} \
 && mkdir -p ${CATALINA_HOME}/temp \
 && rm -rf ${CATALINA_HOME}/webapps/* \ 
 && cp /usr/share/java/mariadb-java-client.jar ${CATALINA_HOME}/lib/ \
 && chmod +x /entrypoint.sh

## TODO already set?
# USER tomcat:tomcat

# define custom entrypoint and command (with remote debugging)
ENTRYPOINT ["/entrypoint.sh"]
CMD ["catalina.sh", "jpda", "run"]

# add sources from build stage
COPY --from=build /usr/local/src/target/celements-web ${CATALINA_HOME}/webapps/ROOT
