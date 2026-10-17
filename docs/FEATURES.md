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
| Quality presets / volume | Implemented | Local validation; bitrate/FPS request can be sent during stream; host decides actual quality; resolution can be requested live for an explicitly selected output |
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
Resolution modes: Host (no preference), Client (screen pixels, max 4K) and fixed sizes, requested live with Apply for an explicitly selected monitor and subject to host acceptance. Decoded statistics show actual dimensions. Stream-local host cursor updates reconcile the helper only outside local gestures; this does not implement full multi-monitor coordinate mapping. See README for protocol details and remaining hardware validation.

### 1.3.4 resolution correction
Host video-configuration messages now carry resolutionX/Y; initialization preferences alone did not implement the host setting. Initial settings are sent once on host configuration or first video. Physical-host acceptance is unconfirmed; the owner reported that 1.3.3 remained at 1920×1080.

### 1.3.5 diagnostic host exchange
Resolution change remains unconfirmed on the owner’s host (1.3.4 stayed 1920×1080). GET video settings and merge-preserving SET are now implemented. Compare requested/host-reported dimensions with actual decoded dimensions; do not treat sent settings as acceptance.

### 1.3.6 monitor targeting
Display list is actively requested with sub-ID 10. Output IDs are preserved/selected explicitly, selections remembered per host, and the decoder init no longer requests a resolution before output mapping. Missing output metadata blocks positive resolution changes. Multi-monitor behavior requires physical-host regression testing.

### 1.3.7 safety correction
Monitor 1 modification still reported on 1.3.6. Resolution SET now requires an explicitly selected output ID matching one unique host video slot; updates use that slot rather than always video[0]. Unknown/duplicate mappings are blocked. Anonymous mapping diagnostics added. Physical-host result still requires verification.

### 1.3.8 startup sequencing
Explicit output selection SET (no resolution fields), followed by GET and matching output acknowledgement, precedes resolution SET. Automatic selection retains host resolutions. Slot IDs are stream configurations, not Windows monitor numbers. Physical acceptance still needs owner validation.

### 1.3.9 detail logging
Persistent diagnostics checkbox, off by default. Disabled mode pauses collection and log text construction while status displays stay active; captured history is retained until reload. Enable before reproducing a bug. Performance gain has not been measured on iPad.

### 1.3.10 temporary monitor recovery
Two-phase selection removed after owner regression report. No automatic host-settings SET before a manual display choice in each connection. Direct explicit selection restored; remembered automatic display/resolution startup remains blocked. Detailed logging toggle retained.

### 1.3.11 readback diagnostics
Manual display selection triggers one debounced settings GET. Actual video-size transitions and fresh host-output indices are logged when detail logging is enabled. Host SET is unchanged; wrong-monitor resolution remains unresolved.

### 1.3.12 missing configuration recovery
Display list without host video settings no longer silently rejects a choice: post-first-frame GET retries are bounded, choices queue until a real response, and missing metadata has a visible status. Wrong-monitor resizing remains unresolved.

### 1.3.13 explicit display restoration
User confirms manual monitor and resolution changes. Startup replays the saved output ID once after fresh list validation and host config arrival. No stored choice or missing ID means no automatic resize. Manual override wins. Windows monitor numbers are not inferred from list order.

Remembered sessions are reloaded and validated after a Safari page-cache return; explicit logout still clears storage. Passwords and two-factor codes are never stored by the app. Lifecycle regression coverage includes return and logout.

### 1.3.14 defer saved monitor restoration until first decoded frame
The owner reports startup still needs an away/back switch, while manual selection works. The previous saved-output SET could run before decoder initialization/first video. Saved output restoration now waits for the first actually decoded frame as well as the validated display list and host configuration, in any arrival order. It sends the same direct selection once; it never cycles through another monitor. Manual choices cancel pending startup restoration and remain immediate. Tests cover all six readiness orders, repeated metadata/frames, stale IDs, manual override and teardown. Physical host behavior remains to be verified; timing is a candidate cause, not a proven host-protocol guarantee.

### 1.3.15 saved settings versus actual resolution
Owner report from 1.3.14 confirms the startup SET is sent after the first decoded frame. The host already reports the desired 1024x768 for the selected output while decoded frames remain 1920x1080; identical settings have no observed effect. For this precise mismatch, startup now sends the actual decoded size to the same saved output, waits for host settings to report that size/output, then sends the desired size once. Other monitor outputs are never selected and other configuration slots are retained. This is a targeted workaround for a suspected host no-op, not proof of host implementation behavior. A three-second deadline, explicit manual selection and disconnect cancel the pending second stage; there is no retry loop. Zero/no-preference resolutions skip the workaround. Stream dimensions remain the authority for actual effect. Synthetic tests cover successful/stale replies, timeout, manual override and teardown. Hardware verification remains required.

### 1.3.16 live resolution changes
The owner confirms saved resolution works at startup. During a connection, Apply now sends the selected resolution immediately to the explicitly selected output, using the proven host-settings merge path and requesting readback. Desired resolution is kept if metadata is not ready; no unknown/default target is resized. Codec changes alone still require reconnect; resolution help and transient feedback are updated in German/English. During a pending startup resolution transition, the latest desired settings are used by its final stage. Actual decoded dimensions remain authoritative; no automatic reconnect occurs.
