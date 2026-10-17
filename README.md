# Parsec Safari 1.3.13

An independent, experimental Parsec web client focused on iPad Safari. It uses an existing Parsec host; no additional software is installed on Windows.

**Open:** https://ukamp.github.io/parsec-safari/

The owner confirmed picture and sound on iPad in the earlier streaming prototype. The new app structure retains that protocol path and adds computer navigation/search, quality presets, volume/mute, stream statistics, Xbox remapping, browser wake lock, password-autofill markup and a Home Screen manifest. The read-only profile/friend integrations, conditional monitor/rumble support and experimental video-only PiP require runtime support. Touch gestures, zoom, special keys and bounded reconnect have been added. Full parity with the official client is not yet implemented; see [feature status and roadmap](docs/FEATURES.md).

The interface supports German and English. English system locales default to English; a saved choice under Settings → Language (German: Einstellungen → Sprache) overrides detection. Changing language reloads the app and ends an active stream.

See [the selected-feature implementation matrix](docs/IMPLEMENTATION-1.3.md) for the current stream UX changes and links to the implemented, conditional and blocked feature matrices.

## Using the iPad app

In Safari, open the main URL above. To launch without the usual Safari address/favorites bars, use Share → Add to Home Screen and enable Open as Web App if offered. Then launch from the new Home Screen icon. The Parsec menu also contains these instructions. iPadOS may still show system bars or a window frame; the page cannot hide OS controls.

The translucent menu button is always at the top right of the stream. Disconnect is available both inside that menu and beside Fullscreen below the stream. Leave expanded view is inside the menu. Input to the PC pauses while the menu is open. Audio is unlocked when connecting; there is no separate audio-unlock button.

Browser fullscreen and Controller view are separate explicit actions, both under the stream and inside the overlay. Browser fullscreen can also be requested from Controller view. If the browser refuses it, the fallback is reported clearly. The owner reports reliable gamecontroller operation **only when launched as a WebApp from the Home Screen** on their tested iPad. Safari-tab controller use remains unstable. This is a user observation, not a guarantee for every iPad. Intermittent RT-related focus loss was reported mainly in native fullscreen; this is **not confirmed fixed**. Controller view avoids the native fullscreen API but is not guaranteed to eliminate the issue. After a recurrence, download the connection report under Diagnostics. It includes RT and focus counters without recording account credentials or controller/device identifiers.

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

Account credentials are sent directly to `https://kessel-api.parsec.app`. Passwords and 2FA codes are never persisted or included in reports. The optional “Angemeldet bleiben” checkbox stores only the bearer session in localStorage for at most 30 days; Parsec can invalidate it sooner. Restored sessions are checked by loading the host list; HTTP 401/403 removes the saved session. Logout clears storage. Without opt-in, the session stays in memory. Use this option only on a trusted device: same-origin scripts can access localStorage. Quality, playback/mute, touch/pointer, controller, reconnect, avatar and language preferences are also stored locally. Use Safari/Apple Passwords for credential autofill. Clearing the local session does not revoke the server-side Parsec session.

Historical vendor modules retain their MIT license at the published `LICENSE`. Protocol adaptations cite the independent MIT lowlat implementation at `7b4dc4ae79990ea8c59a108c80b3c89b695c3cb4`; see the source `app/LICENSE-lowlat` (published as `LICENSE-lowlat`). No proprietary Parsec bundle is redistributed. New project source is MIT licensed; see [LICENSE](LICENSE).

## 1.3.1

- Overlay: compact horizontal tabs, top-right close X, grouped form fields, on-demand help and short settings feedback.
- Explicit native fullscreen and Controller view; manual reconnect to the last successful host in this tab.
- Diagnostics: Overview and Tests tabs. Wake-lock/controller tests are in Tests.
- Checkbox controls stay left of their label on Windows and iPad.
- H.264 is the default again: the owner reports better iPad performance. HEVC remains optional with capability checks and H.264 fallback. Legacy automatic HEVC preferences migrate to H.264.

The owner reported working HEVC on their iPad. Other hardware/host combinations remain to be validated. See the [1.3.1 verification details](docs/IMPLEMENTATION-1.3.md).

## 1.3.1 input corrections

Direct touch jumps to the finger; touchpad motion updates a retained virtual position without jumping when the finger is lifted and placed elsewhere. Touchpad now sends ordinary absolute host coordinates, so it does not depend on Pointer Lock.

A local helper cursor is enabled by default for touch and when the host hides the native cursor. It shows the position this page sends, **not a host-confirmed cursor**, and cannot follow another mouse on the host. It can be disabled in the Controls tab.

Pointer Lock closes the input-pausing overlay before the user-activated request and handles grant, denial, missing API and teardown. Missing APIs disable the option. This does not implement missing iPadOS functionality.

Controller vibration remains unconfirmed/non-working on the owner's iPad. Available actuator methods are checked, and absent APIs disable the controls. A bounded local vibration test is under Diagnostics → Tests. A requested pulse is not labeled as physical success. See [input verification notes](docs/INPUT-1.3.1.md).

### 1.3.2 input and codec preferences
H.264 is preferred after iPad performance feedback. The local helper cursor hides after 2.5 seconds without pointer/touch input; controller polling and settings refresh do not wake it. A controller warning is shown during native browser fullscreen; Home Screen WebApp/controller view remains recommended.

### 1.3.3 resolution and host pointer synchronization
Resolution selection now includes Host (wire initialization no-preference sentinel 0×0), Client (screen CSS pixels × DPR, even dimensions, proportionally capped to 4K), and existing fixed sizes. Requests apply at next connection, are not guaranteed host changes, and decoded dimensions in Statistics remain authoritative. The native host configuration sentinel 65535 is not sent as a video dimension.
Cursor opcode 9 stream-local positions are parsed without images and used to reconcile the local touchpad position only for stream 0, within decoded bounds, in absolute visible mode, with no active touch gesture and at least 200 ms after local pointer input. Updates never wake the idle helper or send input. This is not cross-monitor coordinate mapping: host positions outside the stream, missing host updates and other-monitor activity cannot be reliably mapped with the metadata currently supplied. No monitor offsets are guessed.
Protocol source: [lowlat cursor layout](https://github.com/nomi-san/lowlat/blob/7b4dc4ae79990ea8c59a108c80b3c89b695c3cb4/crates/core/src/cursor.rs) and [initialization semantics](https://github.com/nomi-san/lowlat/blob/7b4dc4ae79990ea8c59a108c80b3c89b695c3cb4/docs/01-protocol.md). Physical iPad / multi-monitor host validation remains required.

### 1.3.4 resolution request correction
The 1.3.3 selector sent dimensions only in the opcode 11 initialization. Host video configuration (opcode 17 / sub-ID 11) omitted `video[0].resolutionX` and `resolutionY`. This release includes both dimensions, including Host's 0×0 sentinel, in that host configuration. It sends initial settings once on a recognized host video-config envelope, or on first video as a fallback. Live bitrate/monitor updates retain the connection's resolution and codec so the next-connection notice remains accurate. Reported/decoded dimensions remain authoritative: sending a request is not proof that Windows accepted it.
Evidence: hugeBlack/OpenParsec commit `e4ba9e21dd3ae0783ce12cc7a0f8a59dca724b07`, `OpenParsec/ParsecSDKBridge.swift` (`handleUserDataEvent`, `updateHostVideoConfig`), `ParsecUserData.swift` (setVideoConfig = 11), and `CParsec.swift` (Host = 0×0). Synthetic integration tests validate framing, startup trigger, one-shot behavior and deferred settings; real host acceptance still needs testing on the owner's iPad.

### 1.3.5 host configuration exchange (acceptance still unconfirmed)
The owner reports 1.3.4 still streams at 1920×1080. The client now actively requests host video settings with opcode 17 / sub-ID 9 / empty NUL-terminated body. A validated sub-ID 11 response is retained in memory and used as the merge base: existing output, other monitors and unknown host fields are preserved while only requested video fields are overwritten. The merged initial request is sent once even if the first-video fallback had already sent a minimal settings request; repeated replies do not loop. Later bitrate/monitor requests use the same merge base and keep deferred resolution semantics. No host response payload, output IDs or text are logged.
Diagnostics distinguishes `host-video-config-requested`, `host-video-config-received` (numeric reportedWidth/Height), `host-video-config-merged-sent` and `stream-settings-sent` (numeric requestedWidth/Height). Neither a host-config reply nor a send is proof of a display-mode change; decoded frame dimensions remain authoritative. The report build identifier is now correct. Evidence: Talhasarac/OpenParsec-Quest `ParsecActivity.java` requestHostVideoConfig/applySettingsToHostVideoConfig and `parsec/bindings/Parsec.java` message IDs; no software installation on Windows.

### 1.3.6 monitor targeting
Owner confirms 1.3.5 resolution changes work, but switching back to Client can affect monitor 1 while monitor 2 is streamed. Decoder initialization now always uses 0×0 (no preference); resolution is sent only through merged host configuration with an explicit or host-reported output ID. No settings SET is sent before the host configuration arrives. If the host reports no usable output, positive resolution fields are withheld and `resolution-target-unresolved` is logged, rather than guessing a physical monitor. Explicit selections are stored locally per peer and validated against a fresh display list before applying settings after reconnect.
The client now requests adapter/display info (opcode 17 / sub-ID 10, empty terminated body), processes the documented sub-ID 12 list, and selects the host-reported output in the UI. Unknown mapping has an explicit placeholder; the first listed monitor is never shown as implicitly active. Blank names fall back to adapter name or ID. Display count, not IDs/names, is included in diagnostics. The actual correspondence between a host-reported output and physical monitor numbers still requires the owner's test; no physical monitor number is guessed.

### 1.3.7 video-slot targeting guard
The owner reports that 1.3.6 still modifies monitor 1 while monitor 2 streams. Previous merging always modified video[0]. The SET serializer can now modify a verified video slot; the client requires an explicit display ID that matches exactly one output in the host's current video array and a currently reported display. Missing or duplicate matches block the SET. Without an explicit display choice, resolution fields are withheld. No ordinal monitor-to-slot mapping is guessed. Tests prove that when the selected ID is in video[1], video[0] is unchanged. This is not yet confirmation that the physical host accepts the intended change.
Diagnostics includes anonymous slot indices, display-list indices (0 means unknown), selected-match booleans and numeric sizes. IDs, names, adapters and raw payloads remain excluded. A report is needed if the current host's mapping is absent or inconsistent. Stream display switching without a matching host video slot remains unsupported rather than routing blindly through slot zero.

### 1.3.8 explicit output before resolution
Owner clarified that explicit display selection works, while the automatic host stream can differ from the stored host configuration output. The five video slots are not physical Windows monitor numbers. This supersedes the slot-matching approach in 1.3.7.
Startup with a remembered display now sends an output-selection SET on stream slot 0 with resolution fields removed from every video record, then requests fresh host configuration. Only a subsequent slot-0 output echo matching that explicit choice permits the resolution SET. Manual monitor selection uses the same sequence. A missing/mismatching reply leaves resolution unchanged and reports unconfirmed selection after 2.5 seconds; teardown cancels the timer. Automatic mode removes all resolution fields and never infers the target from the host's default output. No physical display numbering is inferred, and host acknowledgement is not claimed as proof of actual Windows mode change.

### 1.3.9 optional detailed logging
Diagnostics → Overview has a persistent Enable detailed logging checkbox, off by default. Disabled logging returns before timestamps, filtering, history insertion and log-text rebuilding; ordinary status updates and stream statistics remain active. Existing in-memory events are retained while paused, and resume clears rate-limit timestamps. Enable before reproducing an issue. Reports include the current diagnosticsEnabled flag. This reduces logging work; no FPS/latency improvement is claimed without device measurements.

### 1.3.10 monitor regression recovery
Owner reports the two-phase selection in 1.3.8/1.3.9 broke monitor selection and still changed monitor 1. That path is removed. Startup sends no host-settings SET at all before an explicit monitor choice in the current connection, even if a display preference is stored. Decoder initialization remains 0×0. Manual selection restores the direct slot-0 output/resolution SET used before the regression, validated against the reported display list. Stored choices no longer authorize an automatic resize: the user must select the display each connection. Until then bitrate/FPS requests are also held; audio and decoder controls are unaffected. This is a conservative regression recovery, not a completed automatic startup feature. The owner must validate the restored manual path. Detailed logging toggle remains included.

### 1.3.11 fresh display readback diagnostics
Owner's 1.3.10 report confirms no startup SET, then repeated manual SETs while cached host metadata still refers to the initial output. The owner's Windows monitor 2 supports 1024×768. Automatic resolution remains paused and the control SET format is unchanged. After a successful manual choice, a debounced GET (300 ms) refreshes host settings; receipt never triggers another SET. Pending reads are cancelled on teardown. Reply mapping has separate rate-limit stage names so the preceding cached snapshot does not suppress it. Actual decoded size changes are now recorded on each size transition, without per-frame events. Numeric readback output-list index and selected-output match are added; names/IDs/raw host payloads are still excluded. This improves evidence and removes a stale merge base for later choices; it does not claim the wrong-monitor resolution issue is solved.

### 1.3.12 missing host configuration recovery
The owner's 1.3.11 report shows three display entries but no host-video-config-received event and no selection SET. The client required a merge base, so selection returned false. Host settings are now requested again after the first decoded frame, with up to two retries at one-second intervals and an explicit unavailable status. A user choice made before the merge base arrives is queued (latest choice wins), then sent once using the actual host response. This does not invent a host configuration. Retry timers and pending choice are cleared on disconnect. Startup without a user choice still sends no settings SET. The wrong-monitor resolution issue remains separate and unconfirmed.

### 1.3.13 restore explicitly saved display at startup
The owner confirms direct monitor selection and resolution changes now work: the first Generic PnP entry is Windows monitor 2 (primary), the second is Windows monitor 1. This ordering is user-specific and is never hardcoded. Startup now reuses a locally saved explicit output ID through the same working selectDisplay path, once both the host configuration and fresh display list are available, in either arrival order. It never infers the target from host defaults or array/list indices. Duplicate metadata cannot replay startup; a manual choice overrides pending restoration; stale saved IDs cause no resize and no fallback to a different screen. Without a saved ID, select a monitor once and reconnect. The physical startup result still requires owner verification.

Remembered sessions are reloaded and validated after a Safari page-cache return; explicit logout still clears storage. Passwords and two-factor codes are never stored by the app. Lifecycle regression coverage includes return and logout.
