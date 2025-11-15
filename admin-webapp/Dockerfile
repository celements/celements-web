#  _    _      _           _   _                  _                       _   ______               _                 _ 
#| |  | |    | |         | | (_)           /\   | |                     (_) |  ____|             | |               | |
#| |__| | ___| |_   _____| |_ _  __ _     /  \  | |_   _ _ __ ___  _ __  _  | |__ _ __ ___  _ __ | |_ ___ _ __   __| |
#|  __  |/ _ \ \ \ / / _ \ __| |/ _` |   / /\ \ | | | | | '_ ` _ \| '_ \| | |  __| '__/ _ \| '_ \| __/ _ \ '_ \ / _` |
#| |  | |  __/ |\ V /  __/ |_| | (_| |  / ____ \| | |_| | | | | | | | | | | | |  | | | (_) | | | | ||  __/ | | | (_| |
#|_|  |_|\___|_| \_/ \___|\__|_|\__,_| /_/    \_\_|\__,_|_| |_| |_|_| |_|_| |_|  |_|  \___/|_| |_|\__\___|_| |_|\__,_|
#
# Helvetia Alumni Vue Frontend

## Stage: build
FROM node:lts AS build

WORKDIR /app

# Layer: dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Layer: package
COPY . .
RUN mv .env.${PROFILE_ACTIVE} .env; \
  npm run build

## Stage: execute
FROM caddy:2 AS execute

WORKDIR /srv

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile --overwrite

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
