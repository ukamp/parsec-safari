> Update 1.3.2: H.264 is the default again after iPad performance feedback. HEVC remains optional with H.264 fallback. Historical 1.3.0 preference notes below are superseded.

# 1.3.0 — stream usability and automatic codec selection

This release implements the agreed stream/overlay UX update. Other capability limits remain in the [selected-feature matrix](IMPLEMENTATION-1.1.md) and [HEVC implementation notes](IMPLEMENTATION-1.2.md), with the changes below superseding their former default/UI descriptions.

## Stream and overlay

- The compact horizontal tabs remain keyboard accessible, preserve selection, underline the active tab and scroll horizontally when needed. The targets have a minimum height of 44 CSS pixels.
- An accessible X at the top right closes the overlay and returns focus to the stream. The old Back to stream text action is removed. Disconnect and leave-view actions remain in the header.
- Form fields use consistent grid rows and small view/stream/monitor group headings. Long codec, gesture, fullscreen and stream instructions are expandable details.
- Resolution and codec show a tooltip on hover and an independently focusable/tappable information disclosure. **Takes effect on the next connection** is not a permanent field badge. Applying a corresponding change displays a short, eight-second message.
- Applying settings distinguishes local storage from a request sent to the host. It explicitly does not claim that the host applied bitrate/FPS. Active codec/resolution are still determined by the actual stream; no live codec switch is inferred from saving a preference.
- Audio reports muted or the current volume, synchronizes both sliders and the mute button, and restores the last audible level when unmuting volume zero.
- An idle/disconnected stream shows a clear empty state with Choose computer. After the first successful decoded frame, Reconnect is also available following disconnect. It creates a new connection to that host; it does not restore an application/game session.
- The last successful peer ID stays only in this tab's memory and is cleared on logout, session expiration and pagehide. The reconnect action is disabled during a connection or automatic retry. It uses the current signed-in session.

## Explicit fullscreen choice

Both below the stream and in Picture & quality, **Browser fullscreen** explicitly requests the browser Fullscreen API. It can also replace an already expanded Controller view without first awaiting an exit animation that would lose the user gesture. **Controller view** remains a separate action avoiding native Safari fullscreen. The former preference that silently redirected the fullscreen action has been removed.

A denied/missing native API reports the expanded-viewport fallback; the app never calls that true native fullscreen. Safari/iPadOS still controls system bars, and the unresolved RT issue may recur in native fullscreen.

## Automatic codec preference

New/unset preferences default to **Automatic: prefer HEVC, otherwise H.264**. Existing `hevc` preferences migrate to `auto`; an explicitly stored `h264` value is retained as **Force H.264**. Automatic mode uses the existing browser support guard and bounded H.264 fallback; it does not send an invented new protocol mode. Live quality requests retain the current connection's codec.

The owner reported a working H.265/HEVC stream on their iPad with the actual-decoded-codec statistic. This is user-reported validation of that combination, not independent certification of all devices/hosts. The statistic's helper now reads **The codec actually decoded is shown here**.

## Checks

Regression tests cover native/controller transitions and refusal, synthetic sign-in/host connection/first frame/disconnect/manual reconnect/logout, codec defaults and migration, next-connection feedback and synchronized zero-volume/unmute. Existing HEVC fallback, input release, gamepad, account, diagnostics, audio and translation tests remain required. Actual native Safari behavior and touch target comfort require physical-device feedback.
