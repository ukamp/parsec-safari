# Input findings and corrections — 1.3.1

## User observations (2026-10-17)

- On the user's tested iPad, the gamecontroller is reliably stable **only in the installed WebApp launched from the Home Screen**. The ordinary Safari tab remains unstable. Recommend Home Screen launch for this controller workflow; this is not a claim about every iPad.
- The user could not distinguish direct touch from touchpad and saw no mouse pointer.
- Controller vibration and relative mouse activation did not work on that iPad.

## Corrected client behavior

Direct touch jumps to the finger's location. Touchpad movement updates a retained normalized virtual cursor; lifting/repositioning the finger does not move it. It now uses ordinary absolute mouse-position messages, not raw relative messages that depend on host/browser handling. Sensitivity and displayed video scaling are applied to the deltas. A tap clicks at that retained position. This desktop touchpad emulation is not Pointer Lock or unlimited game-camera motion.

A white local helper cursor shows the position sent by this page, follows letterboxing/zoom, and is hidden while the overlay pauses input, while blocked, or during native Pointer Lock. It appears after touch input (also as a fallback when a host hides the native cursor) and can be switched off. **It is not a host-confirmed cursor**: remote cursor shape/position data is not rendered, and movements by another host mouse are not tracked. Physical iPad/host validation of the new path is still pending.

The previous Pointer Lock button requested capture while the overlay still paused input. It now closes the menu and focuses the canvas before requesting. A grant keeps the overlay closed; error/timeout reopens it with a status. Late grants are handled, and disconnect/pagehide invalidates pending requests and exits capture. Missing API disables the control. Pointer Lock requires browser support and an external pointing device; the touchpad emulation works without it.

Haptic detection checks callable `playEffect` (dual-rumble) or `pulse`, not just the presence of an actuator object. Host rumble remains opt-in and bounded to 120 ms. Missing APIs disable the checkbox and local test. The Diagnostics test requests a single short local pulse without host events and asks the user to confirm physical sensation. Rejected/preempted operations report failure; API presence never means confirmed physical vibration.

## Platform evidence and limits

WebKit's [iPadOS Pointer Lock issue 216621](https://bugs.webkit.org/show_bug.cgi?id=216621) and [Gamepad vibration issue 263022](https://bugs.webkit.org/show_bug.cgi?id=263022) remained open when checked. [Issue 288839](https://bugs.webkit.org/show_bug.cgi?id=288839) is a duplicate of the latter, not proof that vibration was implemented. Runtime checks determine available controls rather than browser-version/UA guesses. Installing a Home Screen WebApp does not create missing browser APIs.

## Verification

Synthetic tests cover direct-vs-touchpad wire coordinates, scaling and position retention across lifts; local cursor visibility, menu suspension and avoiding gesture resets during capability refresh; Pointer Lock ordering, denial/reopen, absent API, pulse-only haptic detection and bounded local test. Existing regression tests remain required. These checks do not confirm physical iPad mouse/rumble support or host cursor synchronization.
