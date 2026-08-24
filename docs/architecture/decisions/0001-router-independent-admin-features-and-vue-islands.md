# ADR 0001: Router-independent admin features and Vue islands

- Status: Accepted
- Date: 2026-08-06
- Related issue: CELDEV-1338

## Context

The attachment UI must replace legacy attachment surfaces without moving their server-owned
navigation into the admin SPA. It is mounted in server-rendered viewers, overlays, document extras,
and asynchronously inserted editor fragments as well as in the SPA.

## Decision

Feature components are router-independent: hosts supply typed context through props and consume
typed events or slots. Thin SPA-route and custom-element adapters translate their host inputs into
that common feature contract; feature components do not import Vue Router.

Each application mount creates its own Pinia and runtime state. A runtime may install a router for
the SPA, but router state is never shared by independent islands.

The component boundary is typed conceptually rather than tied to a vendor implementation: hosts
provide document context and capabilities, and consumers receive selection/action extension points.
Backend authorization remains authoritative.

Islands use light DOM. VueFinder and PrimeVue teleports render outside a shadow root, so shadow DOM
would prevent required theme and overlay styling. Contained application and vendor CSS preserves
legacy host markup while allowing teleported UI to be styled.

## Consequences

- One feature implementation serves both SPA and server-rendered hosts.
- Multiple islands can coexist without mutable Pinia/runtime-state leakage.
- Public feature props, events, slots, and element attributes are compatibility contracts.
- CSS containment and teleport styling require artifact-level tests.

## Alternatives considered

- Coupling features to Vue Router: rejected because server-rendered surfaces do not own the router.
- Mounting the generic SPA everywhere: rejected because it transfers navigation ownership.
- Shadow DOM: rejected because teleports render beyond the shadow boundary.
- Sharing one Pinia instance: rejected because mounts would share mutable lifecycle state.
