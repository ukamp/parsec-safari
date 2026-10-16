# Parsec Safari 1.0.0

An independent, experimental Parsec web client focused on iPad Safari. It uses an existing Parsec host; no additional software is installed on Windows.

**Open:** https://ukamp.github.io/parsec-safari/

The owner confirmed picture and sound on iPad in the earlier streaming prototype. The new app structure retains that protocol path and adds computer navigation/search, quality presets, volume/mute, stream statistics, Xbox remapping, browser wake lock, password-autofill markup and a Home Screen manifest. Full parity with the official client is not yet implemented; see [feature status and roadmap](docs/FEATURES.md).

The interface supports German and English. English system locales default to English; a saved choice under Settings → Language (German: Einstellungen → Sprache) overrides detection. Changing language reloads the app and ends an active stream.

## Using the iPad app

In Safari, open the main URL above. To launch without the usual Safari address/favorites bars, use Share → Add to Home Screen and enable Open as Web App if offered. Then launch from the new Home Screen icon. The Parsec menu also contains these instructions. iPadOS may still show system bars or a window frame; the page cannot hide OS controls.

The translucent menu button is always at the top right of the stream. Disconnect is available both inside that menu and beside Fullscreen below the stream. Leave expanded view is inside the menu. Input to the PC pauses while the menu is open. Audio is unlocked when connecting; there is no separate audio-unlock button.

For controller play, prefer Controller view over native Safari fullscreen. The owner still reports intermittent RT-related focus loss, mainly in native fullscreen; this is **not confirmed fixed**. Controller view avoids the native fullscreen API but is not guaranteed to eliminate the issue. After a recurrence, download the connection report under Diagnostics. It includes RT and focus counters without recording account credentials or controller/device identifiers.

The unauthenticated API access test is under Diagnostics, not on the sign-in form. A running Parsec host and Internet access are required; Home Screen installation does not provide offline streaming.

## Structure

See [architecture](docs/ARCHITECTURE.md). Application code is ordinary JavaScript, HTML and CSS under `app/`; tests live under `tests/`. There are no production npm dependencies and no embedded source-code blobs in the builder.

## Build and test

The existing GitHub Actions Pages workflow fetches the historical MIT modules from `evshiron/parsec-web-client` at `ddfaeb64c0a54f5ef86ea41a753ad15360a8535c` into `vendor-src/`, then runs `python3 scripts/build-client.py`. That compatibility entry point builds the app and runs all regression tests.

For a development checkout with the same pinned `vendor-src/` available, use `npm run build` and `npm test` (Node and Python required). Serve `_site/` over HTTP to inspect locally. These are developer/CI steps, not installation requirements for the Windows host or iPad.

The app is published at the repository root. `/app/`, `/personal-test/` and `/client/` redirect to it, preserving query strings and route hashes. The standalone Safari capability check is under `/compatibility/`.

## Diagnostics

Reports contain technical events, numeric/boolean counters and exact timestamps. The app excludes email addresses, passwords, 2FA codes, session tokens, host names and IP addresses. Reports remain in tab memory until downloaded manually and are not automatically uploaded. Exact timestamps can allow correlation, so reports are not claimed to be fully anonymous.

## Security and licensing

Account credentials are sent directly to `https://kessel-api.parsec.app`. Passwords and 2FA codes are never persisted or included in reports. The optional “Angemeldet bleiben” checkbox stores only the bearer session in localStorage for at most 30 days; Parsec can invalidate it sooner. Restored sessions are checked by loading the host list; HTTP 401/403 removes the saved session. Logout clears storage. Without opt-in, the session stays in memory. Use this option only on a trusted device: same-origin scripts can access localStorage. Quality, controller and language preferences are also stored locally. Use Safari/Apple Passwords for credential autofill. Clearing the local session does not revoke the server-side Parsec session.

Historical vendor modules retain their MIT license at the published `LICENSE`. Protocol adaptations cite the independent MIT lowlat implementation at `7b4dc4ae79990ea8c59a108c80b3c89b695c3cb4`; see the source `app/LICENSE-lowlat` (published as `LICENSE-lowlat`). No proprietary Parsec bundle is redistributed. New project source is MIT licensed; see [LICENSE](LICENSE).
