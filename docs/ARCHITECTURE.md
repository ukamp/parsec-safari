# Architecture

The application is an independent static ES-module client. GitHub Pages serves it; there is no application backend and no additional Windows installation.

- `app/application.js`: coordinates volatile account and connection state, request cancellation, host selection and teardown.
- `app/core/i18n.js` and `translations.js`: German/English UI text, saved language override, English system detection, and explicit static-shell translation markers. The catalog maps stable English symbolic keys to `{de, en}` text pairs; application code calls `t(key)`, and HTML uses `{{key}}` markers. CI checks that every reference exists in both languages. Remote host names are never translated; no DOM mutation observer is used. Language changes reload the app.
- `app/core/`: direct Parsec API transport, personal authentication, allowlisted diagnostics and validated local preferences.
- `app/stream/`: signaling, WebRTC transport, binary control protocol, H.264 video, Opus audio and input translation. Keep these interfaces stable when changing UI.
- `app/browser/`: fullscreen and screen wake lock, including denial and visibility handling.
- `app/features/`: host metadata/account API views, router, quality/playback preferences, stream statistics, gamepad/menu UI, zoom/pointer controls, deliberate software keyboard, browser capability checks and isolated local media tests.
- `app/core/reconnect.js`: bounded retries for known local network failures; cancellation invalidates pending callbacks.
- `app/stream/touch.js`: independent pointer gesture state machine; cancellation releases any drag.
- `app/stream/host-data.js`: bounded display-list parsing; untrusted user-data text is never logged.
- `app/styles/`: responsive app layout and stream overlay styles.
- `tests/`: hardware-independent regression tests against the built artifact. Includes real legacy WASM Opus decoding; video decoding and remote peers are mocked where noted.
- `scripts/build-app.py`: copies versioned source assets, adds the pinned MIT enum/Opus vendor modules, validates imports/syntax, and writes compatibility redirects. No application source or tests are embedded in Python.

## State and ownership

The coordinator owns the active account session in memory and destroys the client before clearing it. An opt-in session store persists only the bearer token for at most 30 days, restores it on startup, and clears it on logout or an authorization rejection. Passwords and 2FA codes are never stored. Each client owns its transport, decoders and input listeners. Each feature owns its controls and accepts a getter for the current client instead of caching a disconnected instance. A generation counter rejects stale authentication/host responses. Diagnostics contain selected numeric/boolean counters and known stages; no host names, addresses, account IDs, credentials or session tokens.

Validated quality/controller preferences, the language selection and explicitly remembered bearer sessions use localStorage. Credentials are left to the browser's password manager. No service worker caches API traffic. RT/focus diagnostics record numeric counters and focus-target categories, not element contents or device identifiers. Exact timestamps remain in history; the export is not claimed to be fully anonymous.

The fullscreen controller waits for native Safari exit before switching modes and ignores late native-exit events after entering Controller view. Hardware-independent fixtures cover delayed/prefixed exit and duplicate events; actual iPadOS chrome and the RT focus issue remain device-dependent.

Revisioned JS/CSS URLs prevent mixed revisions after deployment. The main HTML remains a stable entry point.

## Extending the client

Implement a protocol/API adapter first, add measured fixtures, and then expose a working UI. Do not add buttons backed by guessed endpoints or claim feature parity from a screenshot. For monitor switching, friends and SSO, capture specifications or obtain authorized API documentation before implementation. Do not import proprietary client bundles.

## Entry points

The site root is the product interface. `/app/`, `/personal-test/` and `/client/` redirect to it, preserving query strings and hashes. `/compatibility/` retains the standalone Safari diagnosis. The manifest keeps the former `/app/` identity so installed apps can migrate while the scope and start URL move to the site root.

## 1.2.0 capability boundaries

See [the implementation matrix](IMPLEMENTATION-1.2.md). Conditional display/Rumble/PiP support never implies current host or iPad support. HEVC is opt-in and uses an Annex-B pipeline with parsed SPS codec strings and one bounded H.264 fallback request. A local decoder test is separate from actual host compatibility. The local report still excludes host/account/friend values and network candidates.

Overlay subpages and accessible diagnostic tabs live in `features/navigation.js`. Settings and the overlay share one quality controller. The codec preference applies on the next connection; live quality changes retain the active codec. `stream/hevc.js` parses HEVC NAL units and profile/tier/level. `VideoPlayer` retains parameter sets and reports only a codec that produced a rendered frame.

## 1.3.0 stream UX

See [stream UX notes](IMPLEMENTATION-1.3.md). `quality-settings.js` owns synchronized form/audio state and transient feedback. `FullscreenView.browser()` explicitly requests native fullscreen even from Controller view. The application retains the last successfully streamed peer only in tab memory for manual reconnect; logout/expiry clears it. `videoCodec: auto` maps to the existing guarded HEVC attempt, while stored H.264 remains forced.

## 1.3.1 pointer and capability boundaries

`Input` retains a normalized virtual cursor and sends absolute host coordinates for touchpad gestures. `viewport.js` projects a local helper arrow through the canvas letterbox/zoom geometry; it is not a remote cursor shape/position implementation. `browser/input-capabilities.js` checks usable haptic methods. Pointer Lock closes the overlay before requesting so a grant cannot leave input paused; denial reopens it, and teardown exits/invalidates pending requests. See [input notes](INPUT-1.3.1.md).
