# Feature status — 1.3.1 (2026-10-17)

See [the 1.3.1 implementation matrix](IMPLEMENTATION-1.3.md) for current selected-feature details and explicit blocked capabilities.

This project is not affiliated with Parsec. Full parity with the official web client is a goal, not the current release status.

Reference: [official web-app guide](https://support.parsec.app/hc/en-us/articles/32381650129300-Use-the-Web-App-browser), [official feature matrix](https://support.parsec.app/hc/en-us/articles/32381463419924-Feature-Matrix). The documented official browser target is Chromium; this client specifically explores Safari/iPad support. Documentation is a comparison baseline, not evidence that the official signed-in UI was tested here.

| Function | This release | Verification / limit |
| --- | --- | --- |
| Personal login and 2FA | Implemented | Synthetic 200/201, rejection, malformed response, cancellation and cleanup tests; personal connection previously confirmed by owner |
| Stay signed in | Opt-in | Saves only the bearer session for up to 30 days; Parsec may expire it sooner; logout and HTTP 401/403 clear it |
| German / English | Implemented | English system locale defaults to English; saved user choice wins; language changes reload/disconnect; symbolic-key completeness tests |
| Account password autofill | HTML support | `username` / `current-password`; saving suggestions depend on Safari and device settings |
| Own computer list and search | Implemented | Safe text rendering, sorted cards and local search; no simulated online guarantees |
| Video | H.264 default / optional HEVC, WebCodecs | Owner confirmed real iPad streaming on prior release; refactor retains wire format and decoder, regression fixtures |
| Audio | Opus / native or WASM | Owner confirmed sound on prior release; real synthetic WASM decoding test |
| Xbox controller | Standard mapping + remap | Wire indices, trigger ranges, release and remapping tested; owner reports intermittent RT focus loss, mainly in native fullscreen; unresolved on physical iPad |
| Touch / keyboard / zoom | Implemented with limits | Direct/touchpad, gestures, zoom, ASCII text and special keys; hardware/iPad validation pending |
| Fullscreen / Controller view | Native API + non-native expanded view | Delayed Safari exit and duplicate-event tests; switching keeps the stream surface. OS bars/window frames may remain; physical rendering still needs validation |
| Screen wake lock | Implemented | API denial/release/visibility tests; browser/OS may revoke |
| Quality presets / volume | Implemented | Local validation; bitrate/FPS request can be sent during stream; host decides actual quality; resolution requested on next connection |
| Live statistics | Implemented | Decoded FPS, incoming video data rate, dimensions and dropped packets; not end-to-end latency |
| Home Screen launch | Manifest and icons | Manifest, icons, Apple metadata and menu instructions; Safari installation requires user action; no automatic iPad install dialog or offline streaming |
| Diagnostics | Implemented | Bounded, rate-limited local history/export; API check and local codec tests under Diagnostics; RT/focus counters; exact timestamps mean not fully anonymous |
| Navigation / stream menu | Implemented | Translucent top-right menu; disconnect both in menu and below stream; leave-view action inside menu |
| Root hosting / old links | Implemented | Site root serves app; /app/, /personal-test/, /client/ redirect with query/hash; capability test under /compatibility/ |
| Account profile / friends | Read-only, conditional | /me and /friendships; unavailable and stale-session handling; live API/Safari validation pending |
| Friend requests | Open | No verified mutation contract |
| Teams / SAML SSO | Open | Official matrix lists it; requires verified authentication integration and account entitlement |
| Monitor switching | Conditional / experimental | Enabled only after valid host display data; sends observed output ID; physical confirmation pending |
| H.265 | Optional; H.264 is default (1.3.2) | Annex-B decoder, SPS parsing, support guard and bounded H.264 fallback; owner reports real iPad success; other combinations unconfirmed |
| Rumble | Conditional / experimental | User reports no vibration on tested iPad; actual actuator methods checked, missing APIs disabled, local test separates browser/hardware from host events |
| Clipboard / shared links | Open | Remote protocol not verified |
| Microphone / camera / extra screens / enhanced pen | Not in baseline | Not listed as supported by official web matrix; would require additional browser/host integration |

## Roadmap

1. Capture an RT/focus report from the owner's iPad, compare Controller view with native fullscreen, and validate the native-to-controller transition and Home Screen launch before more protocol work.
2. Obtain verified monitor enumeration and selection messages, then add monitor switching with recorded fixtures.
3. Add account/friends and Teams/SSO only against documented or measured authorized interfaces.
4. Evaluate clipboard, pointer lock, H.265 and rumble individually; report unsupported capabilities explicitly.

No Windows driver or helper is installed by this project. Host-dependent features cannot silently introduce one.

See [1.3.1 input notes](INPUT-1.3.1.md). The user reports gamecontroller stability only in the installed Home Screen WebApp on the tested iPad. Pointer Lock API presence and a local predicted cursor do not certify browser/host behavior.

### 1.3.3 resolution / pointer update
Resolution modes: Host (no preference), Client (screen pixels, max 4K) and fixed sizes, effective next connection and subject to host acceptance. Decoded statistics show actual dimensions. Stream-local host cursor updates reconcile the helper only outside local gestures; this does not implement full multi-monitor coordinate mapping. See README for protocol details and remaining hardware validation.

### 1.3.4 resolution correction
Host video-configuration messages now carry resolutionX/Y; initialization preferences alone did not implement the host setting. Initial settings are sent once on host configuration or first video. Physical-host acceptance is unconfirmed; the owner reported that 1.3.3 remained at 1920×1080.

### 1.3.5 diagnostic host exchange
Resolution change remains unconfirmed on the owner’s host (1.3.4 stayed 1920×1080). GET video settings and merge-preserving SET are now implemented. Compare requested/host-reported dimensions with actual decoded dimensions; do not treat sent settings as acceptance.

### 1.3.6 monitor targeting
Display list is actively requested with sub-ID 10. Output IDs are preserved/selected explicitly, selections remembered per host, and the decoder init no longer requests a resolution before output mapping. Missing output metadata blocks positive resolution changes. Multi-monitor behavior requires physical-host regression testing.

### 1.3.7 safety correction
Monitor 1 modification still reported on 1.3.6. Resolution SET now requires an explicitly selected output ID matching one unique host video slot; updates use that slot rather than always video[0]. Unknown/duplicate mappings are blocked. Anonymous mapping diagnostics added. Physical-host result still requires verification.
