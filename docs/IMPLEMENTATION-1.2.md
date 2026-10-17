# 1.2.2 — navigation and experimental HEVC

The other selected capabilities retain the limits in the [1.1 implementation matrix](IMPLEMENTATION-1.1.md). This release supersedes that file's blocked-HEVC status with an **experimental, opt-in implementation**, not a claim of verified Parsec/iPad interoperability.

## Navigation

The overlay uses compact horizontal Picture & quality, Controls, Audio and Statistics tabs. Return to stream, leave view and disconnect appear as text-style buttons beside the menu title. The selected tab is retained when reopening; arrow keys and Home/End navigate the tabs. Escape closes the overlay. Tabs scroll horizontally on narrow screens, with a thin underline marking the selected tab. All overlay tabs pause host input.

Diagnostics has keyboard-accessible Overview and Tests tabs. Wake-lock and local controller tests moved from Settings into Tests, alongside API, Opus, H.264 and the new HEVC decoding test. The overview retains capability checks and the redacted technical history.

Checkbox labels explicitly use horizontal flex layout, align at the first text line and retain their native input and clickable labels.

## Experimental HEVC

H.264 stays the default. Selecting **Prefer H.265 / HEVC (experimental)** applies on the next connection. The preference is normalized and saved with the other stream settings when remembering is enabled. Live bitrate/FPS changes never silently change the active codec.

The independent MIT [protocol reference §11.5](https://github.com/nomi-san/lowlat/blob/7b4dc4ae79990ea8c59a108c80b3c89b695c3cb4/docs/01-protocol.md) documents init `_flags` 8 for base H.264 and 9 for HEVC, and the same flags in opcode 13 argument 1 for reinitialization. No extra init JSON keys, proprietary SDK or Windows installation are used. These observations remain subject to testing against the user's actual host.

- Before the offer, `VideoDecoder.isConfigSupported` guards the HEVC attempt. A negative/unreadable result selects H.264 and shows a status message.
- Annex-B VPS/SPS/PPS and IRAP are recognized. The SPS profile/tier/level yields the codec string; cached parameter sets accompany separate keyframes, as required by the [W3C HEVC registration](https://www.w3.org/TR/webcodecs-hevc-codec-registration/).
- A host sending H.264 despite an HEVC preference is accepted as H.264. Statistics use the codec that actually produced the last rendered frame, not the requested preference.
- If an HEVC attempt produces no first decoded frame after 8 seconds, or its decoder exhausts recovery, one opcode-13 H.264 request is sent. Decoder state is cleared and delayed HEVC packets are ignored until H.264 parameter sets arrive. A second 8-second deadline disconnects if no replacement frame is decoded.
- This fallback requires a live control channel. Host rejection, connection/authentication failure or unsupported protocol behavior does not magically become a working stream. Network retries remain separately bounded.
- The local HEVC test decodes a repository-owned synthetic 64×64 green frame generated with ffmpeg/libx265. It verifies local decoding/rendering only. No HDR, 10-bit, 4:4:4, 4K performance, latency or battery improvement is promised.

## Verification boundaries

Automated tests cover HEVC SPS/NAL parsing, truncated payloads, cached parameter sets, flags, unsupported-browser selection, decoder-triggered one-shot fallback, H.264 frame confirmation, fallback timeout and teardown with mocked browser/peer APIs. Existing input, gamepad, fullscreen, session, translations, transport, audio and application tests remain required. Browser UI and local decoder results are checked separately; physical Safari/Windows-host HEVC streaming requires the user's hardware test.

## Signed-in computer view

The entire sign-in section (heading, form and password-manager help) is hidden while a session is active. A localized Sign out text button is beside the connection badge in the global top-right header. Signing out uses the existing local cleanup and restores the sign-in section. Expired sessions restore the same signed-out state. Server-side revocation remains unimplemented.
