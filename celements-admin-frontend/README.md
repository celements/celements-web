# Celements Admin Frontend

A modern, modular Vue 3 frontend for the Open-Celements administration interface. Built with Vite and TypeScript, this application serves as the central hub for all Celements administration screens and functionality.

The **Media Library** (powered by [VueFinder](https://github.com/n1crack/vuefinder)) is the first developed entrypoint. The project is designed to continuously grow by adding more routes and views for the full range of admin screens and operations.

---

## ✨ Features

- 🗂️ **Media Library** — First admin entrypoint, a full-featured file/media manager built on VueFinder.
- 🔐 **Authentication** — Uses the existing Celements login session for same-origin API requests.
- 🌍 **Internationalization** — Multi-language support (EN, DE, FR, IT) via [vue-i18n](https://vue-i18n.intlify.dev/).
- 🧩 **Extensible** — Architecture designed for adding more admin views and routes as the platform evolves.

---

## 🛠️ Tech Stack

| Category      | Technology                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Framework     | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)                                           |
| Build Tool    | [Vite 8](https://vite.dev/)                                                                                           |
| State         | [Pinia](https://pinia.vuejs.org/)                                                                                     |
| Router        | [Vue Router 5](https://router.vuejs.org/)                                                                             |
| UI Components | [PrimeVue 4](https://primevue.org/) (unstyled / pass-through)                                                         |
| Styling       | [Tailwind CSS 4](https://tailwindcss.com/) + [tailwindcss-primeui](https://github.com/primefaces/tailwindcss-primeui) |
| Testing       | [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/)                                       |
| Linting       | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)                                                      |
| Media Library | [VueFinder](https://github.com/n1crack/vuefinder)                                                                     |
| Icons         | [Font Awesome 7](https://fontawesome.com/)                                                                            |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- `npm` ≥ 10

### Installation

```sh
npm install
```

### Configuration

For local development, copy the browser and Vite proxy configurations and adjust them for your environment:

```sh
cp public/config.sample.js public/config.js
cp .env.local.sample .env.local
```

The container generates `config.js` from its runtime environment. `.env.local` is used only by the local Vite dev server to configure its API proxy.

---

## 📜 Scripts

| Command                 | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Start dev server with concurrent type-checking and test watching  |
| `npm run build`         | Type-check + run tests + build production bundle                  |
| `npm run preview`       | Preview the production build locally                              |
| `npm run test`          | Run unit tests once with Vitest                                   |
| `npm run test-watch`    | Run unit tests in watch mode                                      |
| `npm run type-check`    | Type-check `.vue` files with `vue-tsc`                            |
| `npm run lint`          | Lint source files with ESLint                                     |
| `npm run lint-fix`      | Auto-fix ESLint issues                                            |
| `npm run format`        | Check code formatting with Prettier                               |
| `npm run format-fix`    | Auto-fix code formatting with Prettier                            |
| `npm run pre-commit`    | Run type-check, format check and lint (recommended as a git hook) |
| `npm run publish:check` | Build and inspect the package without publishing                  |

---

## 🗂️ Project Structure

```
src/
├── assets/         # Static assets (CSS, images)
├── conf/
│   └── routes/     # Vue Router route definitions
├── core/
│   └── types/      # Shared core types
├── medialib/       # Media Library feature components
├── plugins/        # Vue plugin setup (PrimeVue, Router, Pinia, i18n)
├── types/          # Global TypeScript types
├── utils/          # Shared utilities (logger, etc.)
├── views/          # Page-level Vue components (one per route)
├── App.vue         # Root application component
├── bootstrap.ts    # App factory — createCelementsAdminApp()
├── embedded.ts     # Embedded / host integration entry
└── main.ts         # Standalone development entry
```

The SPA bootstrap owns Vue Router. Shared feature components and islands use the router-independent
application runtime, which creates a separate Pinia instance for every mounted Vue application.

## Public package API

The supported `@celements/admin-frontend` entry points are:

- `@celements/admin-frontend/runtime` for `createCelementsApplication()`.
- `@celements/admin-frontend/page-attachments` for the router-free `PageAttachments` component and
  its typed props, selection event, and `attachment-actions` slot contract.
- `@celements/admin-frontend/page-attachments-island` for the guarded
  `<cel-page-attachments>` custom-element registration.
- `@celements/admin-frontend/styles.css` for downstream Vue applications using the feature component.

The custom element accepts `space-name`, `doc-name`, `locale`, and `local-dev`. It dispatches the
bubbling `attachment-selection-change` event. Framework packages are peer dependencies so a
downstream application supplies one Vue, Pinia, PrimeVue, vue-i18n, and VueFinder runtime. Vue
Router remains a development dependency for the deployable SPA shell and is not required by the
published feature, island, or runtime entry points.

`styles.css` is the complete supported stylesheet. It includes the scoped Celements
application/Tailwind styles and the processed VueFinder styles; consumers must not import CSS from
VueFinder or an internal package path separately.

## Forge npm package

The `@celements` scope is hosted at:

```text
https://forge.celhosting.ch/api/packages/celements/npm/
```

The checked-in `.npmrc` maps only the `@celements` scope to Forge. It reads `FORGE_TOKEN`, which
must be an access token with package read access for consumers. Publication is performed only by
the shared `npmPackagePipeline` from `synventis/server-tools`; its Jenkins credential is injected
without logging it.

Install an immutable package version and its required peers (the example pins release `0.1.0`):

```sh
export FORGE_TOKEN='<package-read-token>'
npm install --save-exact @celements/admin-frontend@0.1.0 \
  vue@^3.5.30 pinia@^3.0.4 primevue@^4.5.4 vue-i18n@^11.3.0 vuefinder@^4.1.1
```

Use only declared package exports:

```ts
import { PageAttachments } from '@celements/admin-frontend/page-attachments';
import { registerPageAttachmentsElement } from '@celements/admin-frontend/page-attachments-island';
import { createCelementsApplication } from '@celements/admin-frontend/runtime';
import '@celements/admin-frontend/styles.css';
```

`Jenkinsfile` continues to publish only the Docker image. Package publication is a separate Jenkins
job using `Jenkinsfile.npm`, which calls `npmPackagePipeline(appDir: 'celements-admin-frontend')`:

- a declared `x.y.z-SNAPSHOT` version becomes the unique immutable
  `x.y.z-snapshot.<BUILD_NUMBER>.<GIT_SHA>` version and receives the `snapshot` dist-tag;
- a declared release version `x.y.z` must be built from the exact `admin-frontend-vx.y.z` Git tag
  and receives the `latest` dist-tag;
- publication checks Forge first and refuses to overwrite an existing package version.

Repository code cannot create that Jenkins job. CI operations must configure a job whose script
path is `celements-admin-frontend/Jenkinsfile.npm`; until that infrastructure step exists, the
repository has a verifiable publication path but no package is published automatically.

Build and inspect the publishable package locally without credentials or publication:

```sh
npm run publish:check
```


---

## 🐳 Deployment

The project ships with a multi-stage `Dockerfile` that builds the static assets and serves them via [Caddy](https://caddyserver.com/).

```sh
# Build the Docker image (pass the active profile to select the correct .env file)
docker build --build-arg PROFILE_ACTIVE=prod -t celements-admin-frontend .

# Run the container
docker run -p 80:80 celements-admin-frontend
```

---

## 💻 Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) with the [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur if installed).
- Enable Volar's "Takeover Mode" or use `vue-tsc` for TypeScript support in `.vue` files.
