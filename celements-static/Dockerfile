#    ____                          _____     _                           _       
#   / __ \                        / ____|   | |                         | |      
#  | |  | |_ __   ___ _ __ ______| |     ___| | ___ _ __ ___   ___ _ __ | |_ ___ 
#  | |  | | '_ \ / _ \ '_ \______| |    / _ \ |/ _ \ '_ ` _ \ / _ \ '_ \| __/ __|
#  | |__| | |_) |  __/ | | |     | |___|  __/ |  __/ | | | | |  __/ | | | |_\__ \
#   \____/| .__/ \___|_| |_|      \_____\___|_|\___|_| |_| |_|\___|_| |_|\__|___/
#         | |                                                                     
#         |_|                                                                     
#
# Celements static

## Stage: build admin frontend
FROM node:lts AS admin-frontend

WORKDIR /app

# Layer: dependencies
COPY admin-frontend/package*.json ./
RUN npm ci

# Layer: package
COPY admin-frontend/ .
RUN npm run build

## Stage: execute
FROM caddy:2 AS execute

ARG VERSION
ARG REVISION

LABEL org.opencontainers.image.source="https://github.com/celements/celements-web" \
  org.opencontainers.image.description="Celements static assets" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.revision="${REVISION}"

WORKDIR /srv

COPY --from=admin-frontend /app/dist /srv/admin
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/start
RUN caddy fmt /etc/caddy/Caddyfile --overwrite

EXPOSE 80
ENTRYPOINT ["start"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
