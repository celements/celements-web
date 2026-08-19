# Celements static

This image serves the static Celements applications. `admin-frontend` is its first payload.
The local `package.json` versions the assembled image independently of its payloads.

Build it from the repository root:

```sh
docker build -t celements-static celements-static
```

## Potential improvements

### Asset cache version

The Celements webapp templates append an asset version as `?ver=`. A future
`$services.celementsweb.getAssetVersion()` helper should return the last startup timestamp in
production and the current timestamp in local development (cluster=local), so local changes always
bypass browser caching without disabling production cacheability.

### Entrypoint extension

The image currently has one entrypoint for its first static app. If additional apps need startup
configuration, each app can provide an entrypoint script that the aggregate image copies into
`entrypoint.d/`; a generic runner can execute those scripts in lexical order and fail startup if one
fails.
