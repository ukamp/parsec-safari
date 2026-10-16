# Feature status — 2026-10-16

This project is not affiliated with Parsec. Full parity with the official web client is a goal, not the current release status.

Reference: [official web-app guide](https://support.parsec.app/hc/en-us/articles/32381650129300-Use-the-Web-App-browser), [official feature matrix](https://support.parsec.app/hc/en-us/articles/32381463419924-Feature-Matrix). The documented official browser target is Chromium; this client specifically explores Safari/iPad support. Documentation is a comparison baseline, not evidence that the official signed-in UI was tested here.

| Function | This release | Verification / limit |
| --- | --- | --- |
| Personal login and 2FA | Implemented | Synthetic 200/201, rejection, malformed response, cancellation and cleanup tests; personal connection previously confirmed by owner |
| Account password autofill | HTML support | `username` / `current-password`; saving suggestions depend on Safari and device settings |
| Own computer list and search | Implemented | Safe text rendering, sorted cards and local search; no simulated online guarantees |
| Video | H.264 / WebCodecs | Owner confirmed real iPad streaming on prior release; refactor retains wire format and decoder, regression fixtures |
| Audio | Opus / native or WASM | Owner confirmed sound on prior release; real synthetic WASM decoding test |
| Xbox controller | Standard mapping + remap | All button indices, trigger ranges, signs, release and custom mapping tests; physical iPad validation still needed |
| Touch pointer and keyboard | Implemented | Canvas-focused keyboard; input pauses in menus, on background and outside stream view |
| Fullscreen | Native API + viewport fallback | iPadOS can retain its own status UI; not an immersive-OS guarantee |
| Screen wake lock | Implemented | API denial/release/visibility tests; browser/OS may revoke |
| Quality presets / volume | Implemented | Local validation; bitrate/FPS request can be sent during stream; host decides actual quality; resolution requested on next connection |
| Live statistics | Implemented | Decoded FPS, incoming video data rate, dimensions and dropped packets; not end-to-end latency |
| Home Screen launch | Manifest and icons | Static app entry and Apple metadata; installation must be checked on an iPad |
| Diagnostics | Implemented | Bounded, rate-limited, credential-free export and local codec checks |
| Friends and friend requests | Open | No verified API adapter yet |
| Teams / SAML SSO | Open | Official matrix lists it; requires verified authentication integration and account entitlement |
| Monitor switching | Open | Official web feature; no verified host metadata / control adapter yet |
| H.265 | Open | Do not advertise until packet framing and Safari configurations are tested |
| Clipboard / shared links / rumble | Open | Requires separately verified browser, protocol and permission behavior |
| Microphone / camera / extra screens / enhanced pen | Not in baseline | Not listed as supported by official web matrix; would require additional browser/host integration |

## Roadmap

1. Run the refactored app on the owner's iPad, repeat video/audio/Xbox/wake-lock checks, fix regressions before more protocol work.
2. Obtain verified monitor enumeration and selection messages, then add monitor switching with recorded fixtures.
3. Add account/friends and Teams/SSO only against documented or measured authorized interfaces.
4. Evaluate clipboard, pointer lock, H.265 and rumble individually; report unsupported capabilities explicitly.

No Windows driver or helper is installed by this project. Host-dependent features cannot silently introduce one.
