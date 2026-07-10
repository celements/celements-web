#    ____                          _____     _                           _                     _           _        __          __  _                         
#   / __ \                        / ____|   | |                         | |           /\      | |         (_)       \ \        / / | |      /\                
#  | |  | |_ __   ___ _ __ ______| |     ___| | ___ _ __ ___   ___ _ __ | |_ ___     /  \   __| |_ __ ___  _ _ __    \ \  /\  / /__| |__   /  \   _ __  _ __  
#  | |  | | '_ \ / _ \ '_ \______| |    / _ \ |/ _ \ '_ ` _ \ / _ \ '_ \| __/ __|   / /\ \ / _` | '_ ` _ \| | '_ \    \ \/  \/ / _ \ '_ \ / /\ \ | '_ \| '_ \ 
#  | |__| | |_) |  __/ | | |     | |___|  __/ |  __/ | | | | |  __/ | | | |_\__ \  / ____ \ (_| | | | | | | | | | |    \  /\  /  __/ |_) / ____ \| |_) | |_) |
#   \____/| .__/ \___|_| |_|      \_____\___|_|\___|_| |_| |_|\___|_| |_|\__|___/ /_/    \_\__,_|_| |_| |_|_|_| |_|     \/  \/ \___|_.__/_/    \_\ .__/| .__/ 
#         | |                                                                                                                                    | |   | |    
#         |_|                                                                                                                                    |_|   |_|    #
#
# Open-Celements Admin WebApp Vue Frontend

## Stage: build
FROM node:lts AS build

WORKDIR /app

# Layer: dependencies
COPY package*.json ./
RUN npm ci

# Layer: package
COPY . .
RUN npm run build

## Stage: execute
FROM caddy:2 AS execute

ARG VERSION
ARG REVISION

LABEL org.opencontainers.image.source="https://github.com/celements/celements-web" \
  org.opencontainers.image.description="Celements admin frontend" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.revision="${REVISION}"

WORKDIR /srv

COPY --from=build /app/dist /srv
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/start
RUN caddy fmt /etc/caddy/Caddyfile --overwrite

EXPOSE 80
ENTRYPOINT ["start"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
