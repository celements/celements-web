# ADR 0001: Router-independent admin features and Vue islands

- Status: Accepted
- Date: 2026-08-06
- Decision owners: Celements frontend maintainers
- Related issue: CELDEV-1338

## Context

`celements-admin-frontend` started as a Vue Router application mounted below
`/app/cel/admin/**`. Its bootstrap always created the SPA root and installed a singleton router and
Pinia instance. Feature views such as `PageAttachments` read document context directly from the
active route.

That architecture prevented the same attachment UI from being mounted in server-rendered XWiki
surfaces such as attachment viewers, overlays, document extras, and asynchronously loaded editor
tabs. It also encouraged downstream products to replace routes or copy source when adding
product-specific actions.

CELDEV-1338 requires the VueFinder attachment UI to replace the legacy attachment implementations
without redirecting every existing surface into the SPA. The package must also provide a stable
extension boundary for later downstream use without adding product-specific behavior to
`celements-web`.

## Decision

### Separate features and islands from the SPA shell

Admin features are router-independent Vue components. They receive all host context through typed
props and expose typed events and slots. They must not import or call Vue Router.

Vue islands adapt server-rendered element attributes and properties into feature props. The
server-rendered page owns navigation outside the SPA. Vue Router remains supported, but only the SPA
bootstrap and route adapters install or use it. SPA route adapters translate route parameters into
the same feature props used by islands.

For `PageAttachments`, the shared document contract contains at least `spaceName` and `docName`,
with `locale` available where required by the host. Both the SPA route and
`<cel-page-attachments>` adapt their respective inputs into this contract.

### Use one reusable application runtime

SPA and island applications share setup for PrimeVue, i18n, VueFinder, logging, confirmation
handling, global components, and local-development configuration.

The shared application runtime accepts Vue Router as an optional application-specific plugin. It
creates a new Pinia instance for every mounted application. No mutable Pinia or router singleton is
shared between islands.

### Provide explicit PageAttachments extension contracts

`PageAttachments` exposes:

- a `selectionChange` Vue event containing the document and selected attachments;
- an `attachment-actions` slot containing `document`, `path`, `count`, and
  `selectedAttachments`.

The custom element forwards selection as the bubbling, composed
`attachment-selection-change` DOM event.

Downstream products add attachment actions through these contracts. They must not replace the
Celements route, override the component source, or require product-specific behavior in
`celements-web`.

### Define supported package entry points

The supported `@celements/admin-frontend` imports are:

- `@celements/admin-frontend/runtime`;
- `@celements/admin-frontend/page-attachments`;
- `@celements/admin-frontend/page-attachments-island`;
- `@celements/admin-frontend/styles.css`.

Internal `src/*` paths are not public API.

Vue, Pinia, PrimeVue, vue-i18n, Vue Router, and VueFinder are peer dependencies for the published
library. The deployable SPA/island assets remain self-contained, while a separate library build
externalizes these peers so downstream consumers do not load a second Vue runtime.

### Use a dedicated custom element for the attachment island

The supported island element is `<cel-page-attachments>`. It accepts these attributes and matching
properties:

- `space-name` / `spaceName`;
- `doc-name` / `docName`;
- `locale`;
- `local-dev` / `localDev`.

Registration is guarded. Connecting mounts a fresh application; disconnecting unmounts it; later
reconnection or input changes safely create a new application. Multiple elements on one page remain
state-isolated.

### Keep server-rendered attachment URLs and wrappers

The legacy attachment templates render the router-free island in place. Existing viewer, overlay,
document-extra, attach-action, and editor-tab URLs retain their ownership and wrappers.

Editor-tab fragments use their established lazy-script initialization path to import the island
entry after asynchronous insertion. Module evaluation, custom-element registration, and stylesheet
loading are idempotent so more than one reference does not create duplicate applications or style
links.

The existing REST and authorization boundary remains
`/api/attachments/{spaceName}/{docName}`. VueFinder continues to provide listing, upload, search,
preview, download, and deletion behavior through that API.

### Contain island CSS in light DOM

The island uses scoped light-DOM styles rather than Shadow DOM. VueFinder and PrimeVue teleport
dialogs and overlays outside the component subtree; Shadow DOM would separate those teleports from
required styles and tokens.

Tailwind preflight is excluded. Application utility selectors, heading rules, theme tokens, and
generic vendor reset selectors are scoped to `.cel-admin-surface` and `.cel-admin-teleport`.
VueFinder's namespaced selectors remain available for its teleported UI. Application styles must not
introduce unscoped `:root`, heading, or generic reset rules into surrounding legacy markup.

## Consequences

### Positive

- A feature is implemented once and reused by the SPA and server-rendered islands.
- Legacy URLs and server-side navigation remain stable during incremental migration.
- Multiple islands can coexist without router or Pinia state leakage.
- Downstream attachment actions have a typed extension seam instead of a source fork.
- Package consumers receive intentional imports and share their existing Vue runtime.
- CSS from an island does not reset or retheme the surrounding legacy page.

### Costs and constraints

- Every host must supply required context explicitly rather than relying on ambient route state.
- SPA routes require small adapter components or route-prop functions.
- Deployable assets and publishable library artifacts require separate build outputs.
- Teleported components require coordinated `.cel-admin-teleport` styling and make full Shadow DOM
  encapsulation impractical.
- Public props, events, slots, custom-element attributes, and package entry points are compatibility
  contracts and require deliberate evolution.

## Alternatives considered

### Keep PageAttachments coupled to Vue Router

Rejected because server-rendered pages and fragments do not own or require the SPA router.

### Mount the generic `<cel-admin>` SPA everywhere

Rejected because it transfers navigation ownership to the SPA, adds unrelated routes/runtime state,
and does not preserve incremental server-rendered migration boundaries.

### Let downstream products replace routes or copy the feature

Rejected because replacements drift from the shared REST, security, VueFinder, and package behavior.
A typed action slot and selection contract provide the required extension point.

### Use Shadow DOM for complete CSS isolation

Rejected because VueFinder and PrimeVue teleports render outside the shadow root. Scoped light DOM
contains host-impacting styles while keeping dialogs and overlays functional.

### Share one Pinia instance between mounts

Rejected because multiple islands would share mutable state and lifecycle unexpectedly.

### Continue exporting unrestricted `src/*` paths

Rejected because it exposes implementation layout as public API and prevents internal
reorganization.

### Bundle Vue and framework plugins in the published library

Rejected because downstream applications could receive duplicate framework runtimes. Framework
packages are peers in the library build while deployment assets remain bundled.
