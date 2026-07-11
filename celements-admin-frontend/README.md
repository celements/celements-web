# Open-Celements Admin Frontend

A modern, modular Vue 3 frontend for the Open-Celements administration interface. Built with Vite and TypeScript, this application serves as the central hub for all Celements administration screens and functionality.

The **Media Library** (powered by [VueFinder](https://github.com/n1crack/vuefinder)) is the first developed entrypoint. The project is designed to continuously grow by adding more routes and views for the full range of admin screens and operations.

---

## ✨ Features

- 🗂️ **Media Library** — First admin entrypoint, a full-featured file/media manager built on VueFinder.
- 🔐 **Authentication** — OIDC-based authentication via [oidc-client-ts](https://github.com/authts/oidc-client-ts) (e.g. Keycloak).
- 🌍 **Internationalization** — Multi-language support (EN, DE, FR, IT) via [vue-i18n](https://vue-i18n.intlify.dev/).
- 📊 **Analytics** — Optional [Matomo](https://matomo.org/) integration via vue-matomo.
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

For local development, copy the browser configuration and adjust it for your environment:

```sh
cp public/config.sample.js public/config.js
```

The container generates `config.js` from its runtime environment. The local Vite dev server uses `.env.dev` for its API proxy:

```sh
VITE_CEL_API_URL=http://...
```

---

## 📜 Scripts

| Command              | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `npm run dev`        | Start dev server with concurrent type-checking and test watching  |
| `npm run build`      | Type-check + run tests + build production bundle                  |
| `npm run preview`    | Preview the production build locally                              |
| `npm run test`       | Run unit tests once with Vitest                                   |
| `npm run test-watch` | Run unit tests in watch mode                                      |
| `npm run type-check` | Type-check `.vue` files with `vue-tsc`                            |
| `npm run lint`       | Lint source files with ESLint                                     |
| `npm run lint-fix`   | Auto-fix ESLint issues                                            |
| `npm run format`     | Check code formatting with Prettier                               |
| `npm run format-fix` | Auto-fix code formatting with Prettier                            |
| `npm run pre-commit` | Run type-check, format check and lint (recommended as a git hook) |

---

## 🗂️ Project Structure

```
src/
├── assets/         # Static assets (CSS, images)
├── conf/
│   └── routes/     # Vue Router route definitions
├── core/
│   └── stores/     # Pinia stores (e.g. auth)
├── medialib/       # Media Library feature components
├── plugins/        # Vue plugin setup (PrimeVue, Router, Pinia, i18n, Auth)
├── types/          # Global TypeScript types
├── utils/          # Shared utilities (logger, etc.)
├── views/          # Page-level Vue components (one per route)
├── App.vue         # Root application component
├── bootstrap.ts    # App factory — createCelementsAdminApp()
├── embedded.ts     # Embedded / host integration entry
└── main.ts         # Standalone development entry
```

The app exposes a `createCelementsAdminApp()` factory function from `bootstrap.ts` that allows the frontend to be embedded in a host application or run standalone.

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
