# Selected features — implementation and verification (1.1.0)

This file distinguishes implemented browser behavior from host/browser support and unresolved work. New code was written independently; no GPL OpenParsec implementation or proprietary SDK binary is included.

| Selected feature | Result | Verification / remaining limit |
| --- | --- | --- |
| RT focus loss | Workaround, not confirmed fixed | Apple touch devices default to non-native Controller view when Fullscreen is selected. The preference can be disabled. RT/focus counters remain available. Actual iPad validation is required; OS-level focus cannot be controlled by the page. |
| Automatic reconnect | Implemented | Three attempts at 1/3/7 seconds, only for known local signaling/RTC network failures. Explicit stop/logout/pagehide cancels retries. No retries for host rejection/unknown host codes. |
| Input reset | Implemented | Global release before input attachment and before disconnect; keyboard/mouse/touch/gamepad cleanup; host blocking and menu suspension independent. |
| Host metadata | Implemented, optional fields | Strict boolean online status; bounded text description/build/owner; unknown status stays unknown. Reported-offline hosts cannot be connected until refreshed. Metadata is not added to reports. |
| Last host refresh | Implemented | Local time recorded only after a successful validated response; logout clears it. |
| Account profile | Read-only integration | GET /me; session/generation guards and unavailable/error states. Actual personal API/Safari response still needs verification. |
| Touchpad | Implemented | Relative pointer deltas and saved sensitivity; direct-touch mode remains available. |
| Touch gestures | Implemented | Tap, hold-to-drag, two-finger right click/scroll and pinch. Multi-touch suppresses accidental clicks. Synthetic state-machine tests; real touch hardware still needs validation. |
| Zoom / viewport | Implemented | 1–3x zoom, bounded horizontal/vertical positioning, reset; menu remains outside the transformed canvas. |
| Friends | Read-only integration | GET /friendships; safe plain text; unavailable/error states. Has-more responses are marked incomplete; pagination parameters are not guessed. No invitation or write endpoints. |
| Constant FPS | Request implemented | Sends fullFPS in observed user-data video configuration. Host determines whether the request takes effect. |
| More resolutions | Implemented | 1024x768 through 3840x2160 including 16:10/ultrawide options. Host/decoder determine the actual output; no 4K performance guarantee. |
| Monitor selection | Conditional/experimental | Parse bounded opcode-17/sub-id-12 display JSON. Enable only after a valid list; send only an ID from that list as video.output. Request is not treated as confirmation. No fabricated display names or guessed discovery requests. |
| Keyboard / special keys | Implemented with limits | Deliberately opened text field plus modifier/special-key buttons. Text supports ASCII key presses; unsupported text is rejected visibly. Host keyboard layout determines output. Not a Unicode clipboard bridge. |
| Pointer Lock | Conditional | Explicit user request, availability/denial status, relative movement, Escape exit handled by browser. Not guaranteed on iPad. |
| Extended stats | Implemented where observed | Decoder queue, dropped packets, host encode time from valid opcode 21, selected candidate-pair RTT from getStats. RTT is explicitly not end-to-end latency. IPs/candidate contents are not rendered or logged. |
| Avatars | Optional | Numeric host-owner IDs only; opt-in loading from Parsec's avatar CDN. No avatar/account identifiers in reports. |
| Start muted / remember settings | Implemented | Saved startup mute and remember preferences; stream initialization reapplies volume. |
| Friend requests | Blocked | Only read-only friendships flow verified in source. No reliable current create/accept/remove request contract found; no speculative mutations. |
| Server-side session revocation | Blocked | No verified personal-session revocation contract found. Local logout still clears saved token; it does not claim server revocation. |
| Remote clipboard | Blocked | No verified browser wire contract in examined sources. Browser clipboard availability alone does not establish remote transfer. |
| H.265 | Blocked | Local decoder capability can be checked, but this client still has an H.264 framing/decoder pipeline. No H.265 selector or false negotiation claim. |
| Rumble | Conditional/experimental | Observed opcode 20 pad/large/small motor fields. Opt-in, validated values, rate-limited pulses capped at 120 ms, actuator availability checked, reset on pause/detach. Actual host/browser/controller validation needed. |
| PiP / background | Experimental video-only PiP; background guarantee blocked | Explicit canvas capture + supported browser video PiP API. Unavailable/denied states. No audio capture or promise of continuous iPad background execution. No keepalive tricks. |
| Teams/SSO/Enterprise | Blocked in static personal client | Official Teams API requires Enterprise permissions and secret administrative keys. Requires a separate authorized integration/backend; no keys embedded in GitHub Pages. Personal sign-in cannot be relabeled as SSO. |

## Source observations

- [OpenParsec API consumer](https://github.com/hugeBlack/OpenParsec/blob/e4ba9e21dd3ae0783ce12cc7a0f8a59dca724b07/OpenParsec/MainView.swift): read-only /me and /friendships.
- [OpenParsec data schemas](https://github.com/hugeBlack/OpenParsec/blob/e4ba9e21dd3ae0783ce12cc7a0f8a59dca724b07/OpenParsec/ParsecUserData.swift): display IDs and video output/fullFPS fields. The Swift/SDK code itself is not imported.
- [Independent MIT protocol reference](https://github.com/nomi-san/lowlat/blob/7b4dc4ae79990ea8c59a108c80b3c89b695c3cb4/docs/01-protocol.md): user data (17), rumble (20), encode time (21), release (24).
- [Official Teams API](https://parsec.app/docs/teams-api): Enterprise access and API key requirements.

## Checks

The CI regression suite uses synthetic credentials, mocked peers/decoders where noted, real WASM Opus decoding, gesture state-machine fixtures, stale-session checks, bounded retry/cancellation tests, display/body validation, quality payload fixtures and complete DE/EN translation keys. It cannot certify a physical iPad, Windows host, controller, CORS response or OS permission behavior. Browser runtime smoke checks are reported separately; an unavailable local browser is not counted as a pass.
