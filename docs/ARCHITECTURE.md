# Architecture

The application is an independent static ES-module client. GitHub Pages serves it; there is no application backend and no additional Windows installation.

- `app/application.js`: coordinates volatile account and connection state, request cancellation, host selection and teardown.
- `app/core/`: direct Parsec API transport, personal authentication, allowlisted diagnostics and validated local preferences.
- `app/stream/`: signaling, WebRTC transport, binary control protocol, H.264 video, Opus audio and input translation. Keep these interfaces stable when changing UI.
- `app/browser/`: fullscreen and screen wake lock, including denial and visibility handling.
- `app/features/`: computer cards/search, router, quality profiles, stream statistics, gamepad/menu UI and isolated local media tests.
- `app/styles/`: responsive app layout and stream overlay styles.
- `tests/`: hardware-independent regression tests against the built artifact. Includes real legacy WASM Opus decoding; video decoding and remote peers are mocked where noted.
- `scripts/build-app.py`: copies versioned source assets, adds the pinned MIT enum/Opus vendor modules, validates imports/syntax, and writes compatibility redirects. No application source or tests are embedded in Python.

## State and ownership

The coordinator owns the active account session in memory and destroys the client before clearing it. An opt-in session store persists only the bearer token for at most 30 days, restores it on startup, and clears it on logout or an authorization rejection. Passwords and 2FA codes are never stored. Each client owns its transport, decoders and input listeners. Each feature owns its controls and accepts a getter for the current client instead of caching a disconnected instance. A generation counter rejects stale authentication/host responses. Diagnostics contain selected numeric/boolean counters and known stages; no host names, addresses, account IDs, credentials or session tokens.

Validated quality/controller preferences and explicitly remembered bearer sessions use localStorage. Credentials are left to the browser's password manager. No service worker caches API traffic. Revisioned JS/CSS URLs prevent mixed revisions after deployment. The main HTML remains a stable entry point.

## Extending the client

Implement a protocol/API adapter first, add measured fixtures, and then expose a working UI. Do not add buttons backed by guessed endpoints or claim feature parity from a screenshot. For monitor switching, friends and SSO, capture specifications or obtain authorized API documentation before implementation. Do not import proprietary client bundles.

## Entry points

`/app/` is the product interface. `/personal-test/` and `/client/` redirect to it to retain existing bookmarks. The repository root retains the standalone Safari compatibility diagnosis.
