// Stable English keys; all German and English UI copy lives here.
export const translations={
"resolution.host":{"de":"Host-Auflösung beibehalten","en":"Keep host resolution"},
"resolution.client":{"de":"Client-Auflösung verwenden","en":"Use client resolution"},
"resolution.help":{"de":"Host: keine neue Auflösung anfordern. Client: Bildschirmgröße dieses Geräts in Pixeln anfordern (max. 4K). Alternativ feste Größe wählen. Ab nächster Verbindung; der Host kann die Anfrage ignorieren. Die tatsächliche Größe steht unter Statistik.","en":"Host: request no resolution change. Client: request this device’s screen size in pixels (up to 4K). Or choose a fixed size. Applies to the next connection; the host may ignore the request. Statistics shows the actual size."},
"pointer.multiMonitorHelp":{"de":"Host-Zeigerpositionen werden für den gestreamten Monitor abgeglichen, sofern verfügbar. Auf einem anderen Host-Monitor ist der lokale Hilfszeiger nicht verlässlich. Den Zeiger am Host in den gestreamten Monitor zurückbewegen oder den passenden Monitor auswählen. Keine automatische Mehrmonitor-Kalibrierung.","en":"Host pointer positions are synchronized for the streamed monitor when available. The local helper is not reliable while the host pointer is on another monitor. Move it back into the streamed monitor on the host, or select the matching monitor. Automatic multi-monitor calibration is not available."},
"codec.optionalHevc":{"de":"H.265 / HEVC (optional, mit H.264-Fallback)","en":"H.265 / HEVC (optional, with H.264 fallback)"},
"controller.fullscreenWarning":{"de":"Controller im Browser-Vollbild: Auf dem getesteten iPad können Fokusprobleme auftreten, besonders mit RT. Verwende für Controller bevorzugt die Controlleransicht in der Home-Screen-WebApp.","en":"Controller in browser fullscreen: focus problems can occur on the tested iPad, especially with RT. Prefer controller view in the Home Screen WebApp for controllers."},
"capabilities.pointerLockApi":{"de":"Pointer-Lock-API vorhanden","en":"Pointer Lock API present"},
"pointer.available":{"de":"Pointer-Lock-API vorhanden. Im aktiven Stream mit externer Maus prüfen.","en":"Pointer Lock API is present. Test with an external mouse during a stream."},
"pointer.directHelp":{"de": "Direkte Touch-Maus: Der Zeiger springt an die berührte Stelle.", "en": "Direct touch: the pointer jumps to the place you touch."},
"pointer.touchpadHelp":{"de": "Touchpad: Finger bewegen verschiebt den Zeiger. Abheben und an anderer Stelle aufsetzen bewegt ihn nicht. Tippen klickt an der Zeigerposition.", "en": "Touchpad: moving your finger moves the pointer. Lifting and touching elsewhere does not move it. Tapping clicks at the pointer position."},
"pointer.showCursor":{"de": "Lokalen Hilfszeiger bei Touch anzeigen", "en": "Show local touch pointer"},
"pointer.cursorHelp":{"de": "Der Hilfszeiger zeigt die von dieser Seite gesendete Position. Er verschwindet nach 2,5 Sekunden ohne Zeigereingabe und erscheint bei erneuter Eingabe wieder. Er wird bei verfügbaren Host-Meldungen im gestreamten Monitor abgeglichen. Auf anderen Monitoren kann er abweichen.", "en": "This helper shows the position sent by this page. It hides after 2.5 seconds without pointer input and reappears on new input. Available host updates reconcile it within the streamed monitor. It can differ on other monitors."},
"pointer.lockHelp":{"de": "Pointer Lock benötigt eine externe Maus und Browser-Unterstützung. Er ist nicht für die Touchpad-Geste nötig. Bei Erfolg schließt das Menü; Escape gibt die Maus frei.", "en": "Pointer Lock requires an external mouse and browser support. Touchpad gestures do not need it. The menu closes on success; Escape releases the mouse."},
"controller.webAppStability":{"de": "Auf dem getesteten iPad ist der Gamecontroller laut Nutzer nur in der vom Home-Bildschirm gestarteten WebApp zuverlässig stabil. Für Controller diese Startart verwenden; im Safari-Tab sind weiter Fokusprobleme möglich.", "en": "On the tested iPad, the user reports reliable gamecontroller stability only in the WebApp launched from the Home Screen. Use that launch mode for controllers; Safari tabs may still have focus problems."},
"controller.testRumble":{"de": "Controller-Vibration lokal testen", "en": "Test controller vibration locally"},
"controller.rumble.unavailable":{"de": "Für keinen erkannten Controller ist eine nutzbare Vibrations-API verfügbar.", "en": "No detected controller exposes a usable vibration API."},
"controller.rumble.available":{"de": "Vibrations-API verfügbar. Ob Host-Ereignisse und Hardware funktionieren, ist noch nicht bestätigt.", "en": "Vibration API is available. Host events and physical hardware operation are not yet confirmed."},
"controller.rumble.requested":{"de": "Vibrationsimpuls angefordert. Bitte prüfen, ob er am Controller spürbar war.", "en": "Vibration pulse requested. Please check whether you felt it on the controller."},
"controller.rumble.failed":{"de": "Der Browser hat den Vibrationsimpuls nicht ausgeführt oder abgebrochen.", "en": "The browser did not perform the vibration pulse or interrupted it."},
"controller.rumble.testHelp":{"de": "Der Test sendet nur einen kurzen lokalen Impuls, ohne Parsec-Host.", "en": "The test sends only a short local pulse without a Parsec host."},

"stream.closeOverlay":{"de": "Menü schließen", "en": "Close menu"},
"stream.browserFullscreen":{"de": "Browser-Vollbild", "en": "Browser fullscreen"},
"stream.viewMode":{"de": "Ansicht", "en": "View"},
"stream.displayAndZoom":{"de": "Monitor & Bildausschnitt", "en": "Monitor & viewport"},
"stream.fullscreenHelp":{"de": "Hinweise zu Vollbild und RT", "en": "Fullscreen and RT notes"},
"stream.inputPaused":{"de": "Eingaben an den PC pausieren im Menü.", "en": "Input to your PC is paused in this menu."},
"stream.chooseHost":{"de": "Wähle einen Computer, um den Stream zu starten.", "en": "Choose a computer to start streaming."},
"stream.disconnectedReady":{"de": "Verbindung beendet. Du kannst den letzten Host erneut verbinden.", "en": "Disconnected. You can reconnect to your last host."},
"stream.reconnectLast":{"de": "Erneut verbinden", "en": "Reconnect"},
"stream.chooseComputer":{"de": "Computer auswählen", "en": "Choose computer"},
"stream.help":{"de": "Hinweise zur Bedienung", "en": "Stream controls help"},
"common.details":{"de": "Details", "en": "Details"},
"quality.moreInfo":{"de": "Hinweis zur nächsten Verbindung anzeigen", "en": "Show when this change takes effect"},
"quality.nextConnection":{"de": "Erst ab nächster Verbindung wirksam.", "en": "Takes effect on the next connection."},
"quality.requested":{"de": "Bitrate und Bildrate beim Host angefordert; noch nicht bestätigt.", "en": "Bitrate and frame rate requested from the host; not yet confirmed."},
"quality.notReady":{"de": "Der Stream nimmt momentan keine Einstellungen an.", "en": "The stream is not ready to accept settings."},
"codec.automatic":{"de": "Automatisch: HEVC bevorzugen, sonst H.264", "en": "Automatic: prefer HEVC, otherwise H.264"},
"codec.forceH264":{"de": "H.264 (Standard)", "en": "H.264 (default)"},
"audio.silent":{"de": "Stummgeschaltet", "en": "Muted"},
"audio.playing":{"de": "Ton an · Lautstärke", "en": "Sound on · Volume"},
"pointer.gesturesTitle":{"de": "Touch-Gesten", "en": "Touch gestures"},

"menu.back":{"de": "← Zurück zum Menü", "en": "← Back to menu"},
"menu.picture":{"de": "Bild & Qualität", "en": "Picture & quality"},
"menu.input":{"de": "Steuerung", "en": "Controls"},
"menu.audio":{"de": "Audio", "en": "Audio"},
"menu.statistics":{"de": "Statistik", "en": "Statistics"},
"diagnostics.overview":{"de": "Übersicht", "en": "Overview"},
"diagnostics.tests":{"de": "Tests", "en": "Tests"},
"codec.title":{"de": "Videocodec", "en": "Video codec"},
"codec.experimental":{"de": "H.265 / HEVC bevorzugen (experimentell)", "en": "Prefer H.265 / HEVC (experimental)"},
"codec.help":{"de": "H.264 ist Standard. HEVC ist optional und wird nur nach positiver Browserprüfung angefordert. Bei Decoderfehlern oder ausbleibendem Bild wird einmal H.264 angefordert. Scheitert auch das, wird getrennt. HEVC funktioniert auf dem getesteten iPad, war dort aber weniger performant. Andere Geräte und Hosts benötigen eigene Tests.", "en": "H.264 is the default. Optional HEVC is requested only after a positive browser check. Decoder failure or missing video triggers one H.264 request. If that also fails, the stream disconnects. HEVC works on the tested iPad but performed worse there. Other devices and hosts still need testing."},
"codec.default":{"de": "Hier wird der tatsächlich decodierte Codec angezeigt.", "en": "The codec actually decoded is shown here."},
"codec.unavailable":{"de": "Der Browser meldet kein HEVC. Diese Verbindung verwendet H.264.", "en": "The browser reports no HEVC support. This connection uses H.264."},
"codec.fallback":{"de": "HEVC lieferte kein nutzbares Bild. H.264 wurde angefordert; Bestätigung folgt durch decodierte Bilder.", "en": "HEVC produced no usable video. H.264 was requested; decoded frames will confirm the result."},
"codec.testTitle":{"de": "HEVC-Decoder lokal prüfen", "en": "Test HEVC decoder locally"},
"codec.testHelp":{"de": "Ein synthetisches grünes 64×64-Bild wird decodiert. Dieser Test bestätigt nur den lokalen Decoder, nicht den Parsec-Host.", "en": "Decodes a synthetic green 64×64 image. This tests only the local decoder, not the Parsec host."},
"codec.test":{"de": "HEVC-Decodiertest starten", "en": "Start HEVC decoding test"},
"codec.testing":{"de": "HEVC-Testbild wird decodiert …", "en": "Decoding HEVC test image …"},
"codec.testPassed":{"de": "HEVC-Testbild decodiert und dargestellt. Host-Unterstützung noch nicht bestätigt.", "en": "HEVC test image decoded and displayed. Host support is not yet confirmed."},
"codec.testFailed":{"de": "HEVC-Test fehlgeschlagen. H.264 bleibt verfügbar.", "en": "HEVC test failed. H.264 remains available."},

  "diagnostics.apiTitle": {
    "de": "API-Zugriff prüfen",
    "en": "Test API access"
  },
  "navigation.computers": {
    "de": "Computer",
    "en": "Computers"
  },
  "computers.title": {
    "de": "Deine Computer",
    "en": "Your computers"
  },
  "stream.title": {
    "de": "Dein Stream",
    "en": "Your stream"
  },
  "navigation.settings": {
    "de": "Einstellungen",
    "en": "Settings"
  },
  "navigation.diagnostics": {
    "de": "Diagnose",
    "en": "Diagnostics"
  },
  "navigation.help": {
    "de": "Hilfe & Funktionen",
    "en": "Help & features"
  },
  "connection.notConnected": {
    "de": "Nicht verbunden",
    "en": "Not connected"
  },
  "connection.signedIn": {
    "de": "Angemeldet",
    "en": "Signed in"
  },
  "connection.connecting": {
    "de": "Verbindung wird aufgebaut",
    "en": "Connecting"
  },
  "connection.waitingForVideo": {
    "de": "Warte auf Bild",
    "en": "Waiting for video"
  },
  "connection.active": {
    "de": "Stream aktiv",
    "en": "Stream active"
  },
  "text.readySignInToSeeYourComputers": {
    "de": "Bereit. Melde dich an, um deine Computer zu sehen.",
    "en": "Ready. Sign in to see your computers."
  },
  "text.pleaseEnableJavaScript": {
    "de": "Bitte JavaScript aktivieren.",
    "en": "Please enable JavaScript."
  },
  "auth.signIn": {
    "de": "Bei Parsec anmelden",
    "en": "Sign in to Parsec"
  },
  "text.useYourExistingParsecAccountYourBrowserSendsYour": {
    "de": "Dein vorhandenes Parsec-Konto. Deine Eingaben gehen vom Browser direkt an",
    "en": "Use your existing Parsec account. Your browser sends your credentials directly to"
  },
  "text.theyAreNotSentToASeparateSignIn": {
    "de": ". Sie werden nicht an einen eigenen Anmeldeserver weitergeleitet.",
    "en": ". They are not sent to a separate sign-in server."
  },
  "diagnostics.testApiAccess": {
    "de": "API-Zugriff ohne Anmeldung prüfen",
    "en": "Test API access without signing in"
  },
  "auth.email": {
    "de": "Parsec-E-Mail-Adresse",
    "en": "Parsec email address"
  },
  "auth.password": {
    "de": "Parsec-Passwort",
    "en": "Parsec password"
  },
  "text.2faCodeOptional": {
    "de": "2FA-Code (optional)",
    "en": "2FA code (optional)"
  },
  "text.ifYourAccountUses2FAEnterTheCurrentCode": {
    "de": "Wenn für dein Konto 2FA aktiv ist, trage den aktuellen Code ein. Eine Ablehnung kann auch an Kontofreigaben oder API-Änderungen liegen.",
    "en": "If your account uses 2FA, enter the current code. Account permissions or API changes may also cause a rejection."
  },
  "auth.rememberSession": {
    "de": "Angemeldet bleiben",
    "en": "Stay signed in"
  },
  "text.savesTheSessionOnThisDeviceForUpTo": {
    "de": "Speichert die Sitzung auf diesem Gerät für höchstens 30 Tage, sofern Parsec sie nicht früher beendet. Nur auf deinem eigenen Gerät aktivieren.",
    "en": "Saves the session on this device for up to 30 days unless Parsec ends it sooner. Enable only on your own device."
  },
  "auth.cancel": {
    "de": "Anmeldung abbrechen",
    "en": "Cancel sign-in"
  },
  "auth.signOut": {
    "de": "Abmelden",
    "en": "Sign out"
  },
  "text.safariCanFillYourCredentialsUsingItsPasswordManager": {
    "de": "Safari kann die Anmeldung über seine Passwortverwaltung ausfüllen. Falls kein Speichern angeboten wird, lege in der App „Passwörter“ einen Eintrag für ukamp.github.io mit deinen Parsec-Zugangsdaten an. Die Webseite selbst speichert Passwort und 2FA-Code nicht. Beide Felder werden nach jedem Versuch geleert. Mit „Angemeldet bleiben“ wird ausschließlich die Sitzungskennung auf diesem Gerät gespeichert. Ohne diese Option bleibt sie im Arbeitsspeicher dieses Tabs. Das Verwerfen der lokalen Sitzung widerruft eine serverseitige Sitzung bei Parsec nicht automatisch. Der Verbindungsbericht enthält ausschließlich technische Statusereignisse.",
    "en": "Safari can fill your credentials using its password manager. If saving is not offered, add an entry for ukamp.github.io in Passwords with your Parsec credentials. This website never saves your password or 2FA code; both fields are cleared after each attempt. Stay signed in saves only the session token on this device. Otherwise, the session stays in this tab's memory. Signing out locally does not automatically revoke the session at Parsec. Reports contain only technical status events."
  },
  "text.yourExistingWindowsParsecHostMustBeRunningAnd": {
    "de": "Der vorhandene Parsec-Host auf Windows muss eingeschaltet und erreichbar sein. Es wird nichts auf dem PC installiert.",
    "en": "Your existing Windows Parsec host must be running and reachable. Nothing is installed on your PC."
  },
  "text.refreshHosts": {
    "de": "Hosts aktualisieren",
    "en": "Refresh hosts"
  },
  "text.searchComputers": {
    "de": "Computer suchen",
    "en": "Search computers"
  },
  "computers.searchPlaceholder": {
    "de": "Name des Computers",
    "en": "Computer name"
  },
  "text.remoteScreen": {
    "de": "Entfernter Bildschirm",
    "en": "Remote screen"
  },
  "stream.openMenu": {
    "de": "Parsec-Menü öffnen",
    "en": "Open Parsec menu"
  },
  "text.parsecWebClientMenu": {
    "de": "Parsec-Webclient-Menü",
    "en": "Parsec web client menu"
  },
  "text.parsecMenu": {
    "de": "Parsec-Menü",
    "en": "Parsec menu"
  },
  "text.fullscreenHasNotBeenRequestedYet": {
    "de": "Vollbild noch nicht angefordert.",
    "en": "Fullscreen has not been requested yet."
  },
  "stream.closeMenu": {
    "de": "Zurück zum Stream",
    "en": "Back to stream"
  },
  "stream.leaveView": {
    "de": "Ansicht verlassen",
    "en": "Leave expanded view"
  },
  "text.toggleFullscreen": {
    "de": "Vollbild umschalten",
    "en": "Toggle fullscreen"
  },
  "stream.controllerView": {
    "de": "Controller-Bildschirmansicht",
    "en": "Controller view"
  },
  "install.addToHomeScreen": {
    "de": "Zum Home-Bildschirm hinzufügen",
    "en": "Add to Home Screen"
  },
  "text.openParsecSafariAsAnAppWithoutTheUsual": {
    "de": "So öffnest du Parsec Safari als App ohne die normale Adress- und Favoritenleiste:",
    "en": "Open Parsec Safari as an app without the usual address and favorites bars:"
  },
  "text.ifNeededLeaveExpandedViewFirstAndOpenThis": {
    "de": "Falls nötig, zuerst „Ansicht verlassen“ wählen und diese Seite direkt in Safari öffnen.",
    "en": "If needed, leave expanded view first and open this page directly in Safari."
  },
  "text.inSafariTapShareOpenMoreIfNeededThen": {
    "de": "In Safari auf „Teilen“ tippen, gegebenenfalls „Mehr“ öffnen und „Zum Home-Bildschirm“ wählen.",
    "en": "In Safari, tap Share, open More if needed, then choose Add to Home Screen."
  },
  "text.ifShownEnableOpenAsWebAppThenTap": {
    "de": "Falls angezeigt, „Als Web-App öffnen“ aktivieren und auf „Hinzufügen“ tippen.",
    "en": "If shown, enable Open as Web App, then tap Add."
  },
  "text.thenLaunchParsecSafariUsingTheNewIconOn": {
    "de": "Parsec Safari anschließend über das neue Symbol auf dem Home-Bildschirm starten.",
    "en": "Then launch Parsec Safari using the new icon on your Home Screen."
  },
  "text.ipadosDoesNotLetThisWebsiteOpenTheInstallation": {
    "de": "iPadOS erlaubt der Webseite nicht, diesen Installationsdialog selbst zu öffnen. Systemleisten und Fensterrahmen können weiterhin sichtbar bleiben. In der neu gestarteten App gegebenenfalls erneut anmelden.",
    "en": "iPadOS does not let this website open the installation dialog itself. System bars and window borders may remain visible. You may need to sign in again in the new app."
  },
  "text.ifRTOpensTheKeyboardInSafariFullscreenChoose": {
    "de": "Wenn RT im Safari-Vollbild die Tastatur öffnet: Controller-Bildschirmansicht wählen. Dabei wird kein natives Safari-Vollbild angefordert; Browserleisten können sichtbar bleiben.",
    "en": "If RT opens the keyboard in Safari fullscreen, choose Controller view. This avoids native Safari fullscreen; browser bars may remain visible."
  },
  "audio.mute": {
    "de": "Stummschalten",
    "en": "Mute"
  },
  "audio.unmute": {
    "de": "Ton einschalten",
    "en": "Unmute"
  },
  "stream.disconnect": {
    "de": "Verbindung trennen",
    "en": "Disconnect"
  },
  "stream.noActiveStream": {
    "de": "Noch kein aktiver Stream.",
    "en": "No active stream yet."
  },
  "text.inputToYourPCIsPausedWhileThisMenu": {
    "de": "Solange dieses Menü geöffnet ist, pausieren Eingaben an den PC.",
    "en": "Input to your PC is paused while this menu is open."
  },
  "text.customizeXboxControls": {
    "de": "Xbox-Tastenbelegung anpassen",
    "en": "Customize Xbox controls"
  },
  "text.thePhysicalButtonIsOnTheLeftItsXbox": {
    "de": "Links steht die physische Taste, rechts die gewünschte Xbox-Funktion. Bei doppelter Belegung werden die beiden Funktionen getauscht.",
    "en": "The physical button is on the left, its Xbox action on the right. Assigning an action already in use swaps the two actions."
  },
  "text.invertLeftStickYAxis": {
    "de": "Linken Stick vertikal umkehren",
    "en": "Invert left stick Y axis"
  },
  "text.invertRightStickYAxis": {
    "de": "Rechten Stick vertikal umkehren",
    "en": "Invert right stick Y axis"
  },
  "text.restoreXboxDefaults": {
    "de": "Xbox-Standard wiederherstellen",
    "en": "Restore Xbox defaults"
  },
  "text.xboxDefaultsActive": {
    "de": "Xbox-Standard aktiv.",
    "en": "Xbox defaults active."
  },
  "text.screenWakeLockRequestedWhenStreamingStarts": {
    "de": "Wachhalten wird beim Streamstart angefordert",
    "en": "Screen wake lock requested when streaming starts"
  },
  "stream.fullscreen": {
    "de": "Vollbild",
    "en": "Fullscreen"
  },
  "text.theTranslucentMenuButtonAtTheTopRightOpens": {
    "de": "Der halbtransparente Menüknopf oben rechts öffnet die Einstellungen. „Ansicht verlassen“ im Parsec-Menü beendet die vergrößerte Ansicht. Safari-eigene Hinweise, Datum, Uhrzeit und Systemgesten lassen sich durch diese Seite nicht erzwingen oder abschalten. Für weniger Browserleisten: in Safari „Teilen → Zum Home-Bildschirm“ und von dort öffnen; auch dann kann iPadOS Systemelemente anzeigen.",
    "en": "The translucent menu button at the top right opens settings. Leave expanded view in the Parsec menu exits the expanded view. This page cannot control Safari notices, date, time or system gestures. To reduce browser bars, use Safari's Share → Add to Home Screen and launch from there. iPadOS may still show system controls."
  },
  "text.touchMovesTheAbsoluteMousePointerAndSendsA": {
    "de": "Touch bewegt den absoluten Mauszeiger und sendet einen Linksklick. Tastatureingaben werden nur bei fokussiertem Videobild übertragen. Relative Maussteuerung und alle Spiele sind damit nicht garantiert. Verbindungsstatus, Bild, Ton und Eingaben müssen auf dem echten Host geprüft werden.",
    "en": "Touch moves the absolute mouse pointer and sends a left click. Keyboard input is forwarded only while the video canvas has focus. Relative mouse controls and compatibility with every game are not guaranteed. Test the connection, video, audio and input on your actual host."
  },
  "text.streamSettings": {
    "de": "Stream-Einstellungen",
    "en": "Stream settings"
  },
  "text.changingLanguageReloadsTheAppAndDisconnectsAnyActive": {
    "de": "Ein Sprachwechsel lädt die App neu und trennt eine laufende Verbindung.",
    "en": "Changing language reloads the app and disconnects any active stream."
  },
  "text.bitrateAndFrameRateCanBeRequestedDuringA": {
    "de": "Bitrate und Bildrate lassen sich während der Verbindung anfordern. Eine neue Auflösung wird beim nächsten Verbinden angefordert; der Host entscheidet über die tatsächliche Auflösung.",
    "en": "Bitrate and frame rate can be requested during a connection. A new resolution is requested on the next connection; the host determines the actual resolution."
  },
  "text.quality": {
    "de": "Qualität",
    "en": "Quality"
  },
  "text.balanced": {
    "de": "Ausgewogen",
    "en": "Balanced"
  },
  "text.economy": {
    "de": "Sparsam",
    "en": "Economy"
  },
  "text.highQuality": {
    "de": "Hohe Qualität",
    "en": "High quality"
  },
  "text.custom": {
    "de": "Benutzerdefiniert",
    "en": "Custom"
  },
  "text.bitrateMbps": {
    "de": "Bitrate (Mbit/s)",
    "en": "Bitrate (Mbps)"
  },
  "text.frameRate": {
    "de": "Bildrate",
    "en": "Frame rate"
  },
  "text.resolution": {
    "de": "Auflösung",
    "en": "Resolution"
  },
  "text.volume": {
    "de": "Lautstärke",
    "en": "Volume"
  },
  "text.applySettings": {
    "de": "Einstellungen anwenden",
    "en": "Apply settings"
  },
  "text.settingsAreSavedOnThisDevice": {
    "de": "Einstellungen werden auf diesem Gerät gespeichert.",
    "en": "Settings are saved on this device."
  },
  "text.keepScreenAwake": {
    "de": "Bildschirm wachhalten",
    "en": "Keep screen awake"
  },
  "text.screenWakeLockIsRequestedAutomaticallyOnTheFirst": {
    "de": "Wachhalten wird beim ersten Videobild automatisch angefordert und beim Trennen beendet.",
    "en": "Screen wake lock is requested automatically on the first video frame and released on disconnect."
  },
  "text.testScreenWakeLock": {
    "de": "Wachhalten prüfen",
    "en": "Test screen wake lock"
  },
  "text.withoutAnActiveStreamTheButtonTestsWakeLock": {
    "de": "Ohne laufenden Stream prüft der Knopf die Funktion für drei Sekunden. Safari kann die Freigabe verweigern oder zurücknehmen; der Status zeigt das an.",
    "en": "Without an active stream, the button tests wake lock for three seconds. Safari may deny or release it; the status shows the result."
  },
  "text.gamepadAndJoystick": {
    "de": "Gamepad und Joystick",
    "en": "Gamepad and joystick"
  },
  "text.connectABluetoothOrUSBControllerToYourIPad": {
    "de": "Verbinde einen Bluetooth- oder USB-Controller mit deinem iPad und drücke eine Controller-Taste. Standard-Gamepads können beide Sticks, Trigger und Tasten übertragen. Die lokale Prüfung sendet keine Eingaben an deinen PC.",
    "en": "Connect a Bluetooth or USB controller to your iPad and press a button. Standard gamepads can forward both sticks, triggers and buttons. The local test sends no input to your PC."
  },
  "text.testControllerLocally": {
    "de": "Controller lokal prüfen",
    "en": "Test controller locally"
  },
  "text.noControllerTestedYet": {
    "de": "Noch kein Controller geprüft.",
    "en": "No controller tested yet."
  },
  "text.testAudio": {
    "de": "Ton prüfen",
    "en": "Test audio"
  },
  "text.audioIsUnlockedWhenConnectingTheLocalTestChecks": {
    "de": "Der Ton wird beim Verbinden freigegeben. Mit dem lokalen Test prüfst du Opus-Decoder und Browserausgabe ohne Host-Audiodaten.",
    "en": "Audio is unlocked when connecting. The local test checks the Opus decoder and browser output without host audio."
  },
  "text.playLocalOpusTestTone": {
    "de": "Lokalen Opus-Testton abspielen",
    "en": "Play local Opus test tone"
  },
  "text.notTestedYet": {
    "de": "Noch nicht geprüft.",
    "en": "Not tested yet."
  },
  "text.testVideoDecoderLocally": {
    "de": "Videodecoder lokal prüfen",
    "en": "Test video decoder locally"
  },
  "text.aSyntheticH264ImageIsDecodedDirectlyIn": {
    "de": "Ein synthetisches H.264-Testbild wird direkt im Browser decodiert. Keine Anmeldung und kein Zugriff auf deinen PC.",
    "en": "A synthetic H.264 image is decoded directly in your browser. No sign-in or PC access is required."
  },
  "text.startH264DecoderTest": {
    "de": "H.264-Decodiertest starten",
    "en": "Start H.264 decoder test"
  },
  "text.historyWithoutCredentials": {
    "de": "Verlauf ohne Zugangsdaten",
    "en": "History without credentials"
  },
  "text.noAttemptsYet": {
    "de": "Noch kein Versuch.",
    "en": "No attempts yet."
  },
  "diagnostics.downloadReport": {
    "de": "Verbindungsbericht herunterladen",
    "en": "Download connection report"
  },
  "text.openAsAnIPadApp": {
    "de": "Als App auf dem iPad öffnen",
    "en": "Open as an iPad app"
  },
  "text.inSafariShareAddToHomeScreenTheApp": {
    "de": "In Safari: Teilen → Zum Home-Bildschirm. Das App-Symbol öffnet diesen Client ohne die normale Safari-Adressleiste. iPadOS kann dennoch Systemleisten anzeigen.",
    "en": "In Safari: Share → Add to Home Screen. The app icon opens this client without Safari's usual address bar. iPadOS may still show system bars."
  },
  "text.autofillSignIn": {
    "de": "Anmeldung ausfüllen lassen",
    "en": "Autofill sign-in"
  },
  "text.theFieldsSupportApplePasswordAutoFillIfSafariDoes": {
    "de": "Die Felder unterstützen Apples Passwort-Autofill. Falls Safari kein Speichern anbietet: in „Passwörter“ einen Eintrag für ukamp.github.io mit deinen Parsec-Zugangsdaten anlegen. Mit „Angemeldet bleiben“ kannst du die Sitzung auf diesem Gerät speichern. „Sitzung hier verwerfen“ entfernt sie wieder.",
    "en": "The fields support Apple Password AutoFill. If Safari does not offer to save, add an entry for ukamp.github.io in Passwords using your Parsec credentials. Stay signed in saves the session on this device. Sign out on this device removes it."
  },
  "text.xboxController": {
    "de": "Xbox-Controller",
    "en": "Xbox controller"
  },
  "text.pairWithYourIPadPressAButtonAndTest": {
    "de": "Am iPad koppeln, eine Taste drücken und unter „Einstellungen“ lokal prüfen. Die Belegung änderst du im Stream-Menü.",
    "en": "Pair with your iPad, press a button and test locally in Settings. Change button assignments in the stream menu."
  },
  "text.features": {
    "de": "Funktionsumfang",
    "en": "Features"
  },
  "text.independentExperimentalClientTheUserHasConfirmedVideoAnd": {
    "de": "Unabhängiger, experimenteller Client. Bild und Ton auf dem iPad wurden vom Nutzer bestätigt. Keine offizielle Parsec-App.",
    "en": "Independent, experimental client. The user has confirmed video and audio on iPad. This is not an official Parsec app."
  },
  "text.includedPersonalSignInWith2FAComputerListAnd": {
    "de": "Enthalten: Anmeldung mit 2FA, optionale Kontodaten und Freundesliste, Hostdetails, H.264/Opus, Touchpad und Gesten, Zoom, Sondertasten, Controllerbelegung, bedingte Monitorauswahl, kurze Vibration, Wiederverbindung, Wachhalten und Diagnose. API-, Host- und Browser-Unterstützung werden benötigt.",
    "en": "Included: sign-in with 2FA, optional account/friend lists, host details, H.264/Opus, touchpad and gestures, zoom, special keys, controller mapping, conditional monitor selection, short vibration, reconnect, wake lock and diagnostics. API, host and browser support are required."
  },
  "text.notYetAvailableFriendsTeamsSSOMonitorSwitchingClipboard": {
    "de": "Noch offen: Freundschaftsanfragen, serverseitiger Sitzungswiderruf, Teams/SSO, Remote-Zwischenablage. HEVC ist experimentell. Der RT-Fokusverlust ist nicht nachweislich behoben; die Controlleransicht umgeht natives Safari-Vollbild.",
    "en": "Still open: friend requests, server-side session revocation, Teams/SSO, remote clipboard. HEVC is experimental. RT focus loss is not confirmed fixed; Controller view avoids native Safari fullscreen."
  },
  "text.officialWebClient": {
    "de": "Offizieller Webclient",
    "en": "Official web client"
  },
  "text.safariCompatibilityTest": {
    "de": "Safari-Kompatibilitätstest",
    "en": "Safari compatibility test"
  },
  "text.sourceCodeAndFeatureComparison": {
    "de": "Quellcode und Funktionsvergleich",
    "en": "Source code and feature comparison"
  },
  "text.protocolReference": {
    "de": "Protokollreferenz",
    "en": "Protocol reference"
  },
  "text.signInAttemptCancelled": {
    "de": "Anmeldeversuch abgebrochen.",
    "en": "Sign-in attempt cancelled."
  },
  "text.localSessionClearedTheSessionMayStillRemainValid": {
    "de": "Lokale Sitzung verworfen. Die Freigabe bei Parsec bleibt gegebenenfalls bestehen.",
    "en": "Local session cleared. The session may still remain valid at Parsec."
  },
  "text.pleaseEnterYourParsecEmailAddressAndPassword": {
    "de": "Bitte Parsec-E-Mail-Adresse und Passwort eintragen.",
    "en": "Please enter your Parsec email address and password."
  },
  "text.signingInDirectlyWithParsec": {
    "de": "Anmeldung wird direkt an Parsec gesendet …",
    "en": "Signing in directly with Parsec …"
  },
  "text.pleaseCheckYour2FACodeAccountPermissionsAndCredentials": {
    "de": "Bitte 2FA-Code, Kontofreigabe und Zugangsdaten prüfen.",
    "en": "Please check your 2FA code, account permissions and credentials."
  },
  "text.tooManyAttemptsPleaseWaitBeforeTryingAgain": {
    "de": "Zu viele Versuche. Bitte warten und nicht wiederholt anmelden.",
    "en": "Too many attempts. Please wait before trying again."
  },
  "text.theResponseDoesNotMatchTheDocumentedLegacySign": {
    "de": "Die Antwort passt nicht zum dokumentierten älteren Anmeldeformat.",
    "en": "The response does not match the documented legacy sign-in format."
  },
  "text.credentialsAccountPermissionsOrAPIChangesMayBeResponsible": {
    "de": "Zugangsdaten, Kontofreigabe oder API-Version können die Ursache sein.",
    "en": "Credentials, account permissions or API changes may be responsible."
  },
  "text.signInNotConfirmedHTTP": {
    "de": "Anmeldung nicht bestätigt (HTTP ",
    "en": "Sign-in not confirmed (HTTP "
  },
  "text.thisBrowserCouldNotSaveTheSessionForStaying": {
    "de": "Angemeldet bleiben konnte in diesem Browser nicht gespeichert werden.",
    "en": "This browser could not save the session for staying signed in."
  },
  "text.parsecReturnedASessionTokenLoadingHosts": {
    "de": "Parsec hat eine Sitzungskennung zurückgegeben. Hosts werden geladen …",
    "en": "Parsec returned a session token. Loading hosts …"
  },
  "text.noReadableSignInResponseATimeoutNetworkIssue": {
    "de": "Keine lesbare Anmeldeantwort. Zeitlimit, Netzwerk oder CORS können die Ursache sein. Keine Anmeldung bestätigt.",
    "en": "No readable sign-in response. A timeout, network issue or CORS may be responsible. Sign-in has not been confirmed."
  },
  "text.loadingHosts": {
    "de": "Hosts werden geladen …",
    "en": "Loading hosts …"
  },
  "text.yourSessionHasExpiredPleaseSignInAgain": {
    "de": "Die Sitzung ist abgelaufen. Bitte erneut anmelden.",
    "en": "Your session has expired. Please sign in again."
  },
  "text.hostsLoadedSelectYourExistingWindowsHost": {
    "de": "Hostliste geladen. Wähle deinen vorhandenen Windows-Host.",
    "en": "Hosts loaded. Select your existing Windows host."
  },
  "text.unableToLoadHostsCheckYourSessionBrowserPermissions": {
    "de": "Hostliste nicht abrufbar. Sitzung, Browserfreigabe (CORS) und API-Version prüfen.",
    "en": "Unable to load hosts. Check your session, browser permissions (CORS) and API version."
  },
  "text.unableToLoadHosts": {
    "de": "Hostliste konnte nicht geladen werden.",
    "en": "Unable to load hosts."
  },
  "text.webrtcIsUnavailable": {
    "de": "WebRTC ist nicht verfügbar.",
    "en": "WebRTC is unavailable."
  },
  "text.thisClientRequiresTheWebCodecsH264DecoderPlease": {
    "de": "Dieser Test benötigt den H.264-Decoder von WebCodecs. Bitte einen Browser mit VideoDecoder verwenden.",
    "en": "This client requires the WebCodecs H.264 decoder. Please use a browser with VideoDecoder support."
  },
  "text.connectingWithTheExperimentalAdapterConnectionNotYetConfirmed": {
    "de": "Experimenteller Verbindungsaufbau … Noch keine Verbindung bestätigt.",
    "en": "Connecting with the experimental adapter … Connection not yet confirmed."
  },
  "text.transportChannelOpenWaitingForTheStreamResponseAnd": {
    "de": "Transportkanal offen. Warte auf Stream-Antwort und Videobild …",
    "en": "Transport channel open. Waiting for the stream response and video …"
  },
  "text.theControlChannelOpenedButNoVideoFrameWas": {
    "de": "Steuerkanal war offen, aber innerhalb von 20 Sekunden wurde kein Videobild bestätigt.",
    "en": "The control channel opened but no video frame was confirmed within 20 seconds."
  },
  "text.firstVideoFrameDecodedAndDisplayedPleaseCheckMotion": {
    "de": "Erstes Videobild decodiert und dargestellt. Bitte Bildfluss, Ton und Eingaben prüfen.",
    "en": "First video frame decoded and displayed. Please check motion, audio and input."
  },
  "text.connectionEndedCode": {
    "de": "Verbindung beendet (Code ",
    "en": "Connection ended (code "
  },
  "text.protocolHostPermissionsOrNetworkIssuesMayBeResponsible": {
    "de": "). Protokoll, Hostfreigabe oder Netzwerk können die Ursache sein.",
    "en": "). Protocol, host permissions or network issues may be responsible."
  },
  "text.connectionSetupFailedCompatibilityOfTheExperimentalAdapterHas": {
    "de": "Verbindungsaufbau fehlgeschlagen. Der experimentelle Adapter ist nicht als kompatibel bestätigt.",
    "en": "Connection setup failed. Compatibility of the experimental adapter has not been confirmed."
  },
  "text.disconnected": {
    "de": "Verbindung getrennt.",
    "en": "Disconnected."
  },
  "text.safariHasNotLeftFullscreenYetCloseItUsing": {
    "de": "Safari hat das Vollbild noch nicht verlassen. Bitte über Safaris X schließen und erneut Controller-Bildschirmansicht wählen.",
    "en": "Safari has not left fullscreen yet. Close it using Safari's X, then choose Controller view again."
  },
  "text.nativeBrowserFullscreenActiveSystemControlsAreManagedBy": {"de": "Browser-Vollbild aktiv.", "en": "Browser fullscreen is active."},
  "text.controllerViewWithoutNativeSafariFullscreenBrowserBarsMay": {"de": "Controlleransicht aktiv (ohne natives Vollbild).", "en": "Controller view is active (without native fullscreen)."},
  "text.safariDidNotGrantNativeFullscreenExpandedViewActive": {"de": "Der Browser hat kein natives Vollbild gewährt. Vergrößerte Ansicht aktiv.", "en": "The browser did not grant native fullscreen. Expanded view is active."},
  "text.fullscreenEnded": {
    "de": "Vollbild beendet.",
    "en": "Fullscreen ended."
  },
  "text.testingAPIAccessFromThisBrowserWithoutAReal": {
    "de": "API-Zugriff aus diesem Browser wird ohne echte Sitzung geprüft …",
    "en": "Testing API access from this browser without a real session …"
  },
  "text.apiResponseIsReadableInTheBrowserHTTP401": {
    "de": "API-Antwort ist im Browser lesbar (HTTP 401 wie erwartet). Das bestätigt den API-Zugriff, noch keine Anmeldung.",
    "en": "API response is readable in the browser (HTTP 401 as expected). This confirms API access, not sign-in."
  },
  "text.apiRespondedWithHTTP": {
    "de": "API antwortet mit HTTP ",
    "en": "API responded with HTTP "
  },
  "text.signInAndConnectionHaveNotBeenConfirmed": {
    "de": ". Anmeldung und Verbindung sind damit nicht bestätigt.",
    "en": ". Sign-in and connection have not been confirmed."
  },
  "text.apiResponseIsUnreadableCORSOrNetworkIssuesMay": {
    "de": "API-Antwort nicht lesbar. CORS oder Netzwerk können einen direkten Zugriff von GitHub Pages verhindern.",
    "en": "API response is unreadable. CORS or network issues may block direct access from GitHub Pages."
  },
  "text.noControllerDetectedPairItWithYourIPadAnd": {
    "de": "Kein Controller erkannt. Am iPad koppeln und eine Controller-Taste drücken.",
    "en": "No controller detected. Pair it with your iPad and press a controller button."
  },
  "text.controllerDetectedWithoutStandardMappingACompatibleMappingIs": {
    "de": "Controller erkannt, aber ohne Standardbelegung. Eine passende Zuordnung ist noch erforderlich.",
    "en": "Controller detected without standard mapping. A compatible mapping is required."
  },
  "text.controllerInputPaused": {
    "de": "Controller-Eingaben pausiert.",
    "en": "Controller input paused."
  },
  "text.standardGamepadSDetected": {
    "de": " Standard-Gamepad(s) erkannt · ",
    "en": " standard gamepad(s) detected · "
  },
  "text.activeInputs": {
    "de": " aktive Eingaben.",
    "en": " active inputs."
  },
  "text.buttons": {
    "de": " Tasten: ",
    "en": " Buttons: "
  },
  "text.off": {
    "de": "Aus",
    "en": "Off"
  },
  "text.stopControllerTest": {
    "de": "Controllerprüfung beenden",
    "en": "Stop controller test"
  },
  "text.controllerMappingSavedOnThisDevice": {
    "de": "Controllerbelegung auf diesem Gerät gespeichert.",
    "en": "Controller mapping saved on this device."
  },
  "text.controllerMappingActiveOnlyInThisTab": {
    "de": "Controllerbelegung nur für diesen Tab aktiv.",
    "en": "Controller mapping active only in this tab."
  },
  "text.doNotForward": {
    "de": "Nicht übertragen",
    "en": "Do not forward"
  },
  "text.viewBack": {
    "de": "Ansicht / Back",
    "en": "View / Back"
  },
  "text.menuStart": {
    "de": "Menü / Start",
    "en": "Menu / Start"
  },
  "text.leftStickClick": {
    "de": "Linker Stickdruck",
    "en": "Left stick click"
  },
  "text.rightStickClick": {
    "de": "Rechter Stickdruck",
    "en": "Right stick click"
  },
  "text.dPad": {
    "de": "Steuerkreuz ↑",
    "en": "D-pad ↑"
  },
  "text.dPad2": {
    "de": "Steuerkreuz ↓",
    "en": "D-pad ↓"
  },
  "text.dPad3": {
    "de": "Steuerkreuz ←",
    "en": "D-pad ←"
  },
  "text.dPad4": {
    "de": "Steuerkreuz →",
    "en": "D-pad →"
  },
  "text.wakeLockActiveTheScreenStaysOnWhileThe": {
    "de": "Wachhalten aktiv – der Bildschirm bleibt während des sichtbaren Streams an.",
    "en": "Wake lock active — the screen stays on while the stream is visible."
  },
  "text.wakeLockEnded": {
    "de": "Wachhalten beendet.",
    "en": "Wake lock ended."
  },
  "text.wakeLockIsPausedWhileThePageIsHidden": {
    "de": "Wachhalten pausiert, solange die Seite nicht sichtbar ist.",
    "en": "Wake lock is paused while the page is hidden."
  },
  "text.safariReleasedTheWakeLockUseTestScreenWake": {
    "de": "Safari hat das Wachhalten freigegeben. Mit „Wachhalten prüfen“ erneut versuchen.",
    "en": "Safari released the wake lock. Use Test screen wake lock to try again."
  },
  "text.safariDidNotGrantAWakeLock": {
    "de": "Safari hat das Wachhalten nicht gewährt.",
    "en": "Safari did not grant a wake lock."
  },
  "text.thisBrowserDoesNotSupportTheScreenWakeLock": {
    "de": "Dieser Browser bietet keine Screen-Wake-Lock-API.",
    "en": "This browser does not support the Screen Wake Lock API."
  },
  "text.screenStaysOn": {
    "de": "Bildschirm bleibt an",
    "en": "Screen stays on"
  },
  "text.wakeLock": {
    "de": "Wachhalten: ",
    "en": "Wake lock: "
  },
  "text.off2": {
    "de": "aus",
    "en": "off"
  },
  "text.paused": {
    "de": "pausiert",
    "en": "paused"
  },
  "text.released": {
    "de": "freigegeben",
    "en": "released"
  },
  "text.denied": {
    "de": "abgelehnt",
    "en": "denied"
  },
  "text.unavailable": {
    "de": "nicht verfügbar",
    "en": "unavailable"
  },
  "text.savedOnThisDevice": {
    "de": "Auf diesem Gerät gespeichert. ",
    "en": "Saved on this device. "
  },
  "text.activeOnlyInThisTab": {
    "de": "Nur in diesem Tab aktiv. ",
    "en": "Active only in this tab. "
  },
  "text.bitrateAndFrameRateRequestedNewResolutionAppliesOn": {
    "de": "Bitrate und Bildrate angefordert. Neue Auflösung gilt beim nächsten Verbinden.",
    "en": "Bitrate and frame rate requested. New resolution applies on the next connection."
  },
  "text.streamNotReadyYetTheseSettingsApplyOnThe": {
    "de": "Stream noch nicht bereit; die Werte gelten beim nächsten Verbinden.",
    "en": "Stream not ready yet; these settings apply on the next connection."
  },
  "text.appliesOnTheNextConnection": {
    "de": "Gilt beim nächsten Verbinden.",
    "en": "Applies on the next connection."
  },
  "text.computerReportedByParsec": {
    "de": "Von Parsec gemeldeter Computer",
    "en": "Computer reported by Parsec"
  },
  "text.connect": {
    "de": "Verbinden",
    "en": "Connect"
  },
  "text.noComputersMatchYourSearch": {
    "de": "Kein Computer passt zu deiner Suche.",
    "en": "No computers match your search."
  },
  "text.noComputersReportedCheckThatYourExistingParsecHost": {
    "de": "Keine Computer gemeldet. Prüfe, ob dein vorhandener Parsec-Host läuft.",
    "en": "No computers reported. Check that your existing Parsec host is running."
  },
  "text.webcodecsIsUnavailableHere": {
    "de": "WebCodecs ist hier nicht verfügbar.",
    "en": "WebCodecs is unavailable here."
  },
  "text.decodingASyntheticH264Image": {
    "de": "Synthetisches H.264-Bild wird decodiert …",
    "en": "Decoding a synthetic H.264 image …"
  },
  "text.passedH264TestImageDecodedAndDisplayedOn": {
    "de": "Bestanden: H.264-Testbild decodiert und auf Canvas dargestellt. Keine Parsec-Verbindung getestet.",
    "en": "Passed: H.264 test image decoded and displayed on canvas. No Parsec connection was tested."
  },
  "text.theLocalH264DecoderTestFailedPleaseDownload": {
    "de": "Der lokale H.264-Decodiertest ist fehlgeschlagen. Bitte den Bericht herunterladen.",
    "en": "The local H.264 decoder test failed. Please download the report."
  },
  "text.preparingOpusTestTone": {
    "de": "Opus-Testton wird vorbereitet …",
    "en": "Preparing Opus test tone …"
  },
  "text.opusTestToneDecodedAndScheduledForPlaybackPlease": {
    "de": "Opus-Testton decodiert und zur Ausgabe eingeplant. Bitte prüfen, ob du den kurzen Ton hörst.",
    "en": "Opus test tone decoded and scheduled for playback. Please check whether you hear the short tone."
  },
  "text.noTestToneWasScheduledPleaseDownloadTheReport": {
    "de": "Kein Testton eingeplant. Bitte Bericht herunterladen.",
    "en": "No test tone was scheduled. Please download the report."
  },
  "text.audioUnlockOrOpusDecodingFailedPleaseDownloadThe": {
    "de": "Audiofreigabe oder Opus-Decodierung fehlgeschlagen. Bitte Bericht herunterladen.",
    "en": "Audio unlock or Opus decoding failed. Please download the report."
  },
  "text.expandedViewBrowserBarsMayRemainVisible": {
    "de": "Bildschirmansicht · Browserleisten können sichtbar bleiben",
    "en": "Expanded view · Browser bars may remain visible"
  },
  "text.decodedFPS": {
    "de": " decodierte FPS · ",
    "en": " decoded FPS · "
  },
  "text.droppedPackets": {
    "de": " verworfene Pakete",
    "en": " dropped packets"
  },
  "stream.menuSuffix": {
    "de": " Menü",
    "en": " Menu"
  },
  "text.historyStaysInThisTabSMemoryItContains": {
    "de": "Der Verlauf bleibt im Arbeitsspeicher dieses Tabs. Er enthält technische Ereignisse, Zähler und genaue Zeitstempel, aber keine E-Mail-Adressen, Passwörter, 2FA-Codes, Sitzungskennungen, Hostnamen oder IP-Adressen. Diese Seite überträgt den Bericht nicht automatisch; du kannst ihn selbst herunterladen. Wegen der Zeitstempel ist er nicht vollständig anonym.",
    "en": "History stays in this tab's memory. It contains technical events, counters and precise timestamps, but no email addresses, passwords, 2FA codes, session tokens, host names or IP addresses. This page does not upload the report automatically; you can download it yourself. Because of the timestamps, it is not fully anonymous."
  },
  "settings.language": {
    "de": "Sprache / Language",
    "en": "Language"
  },
  "language.german": {
    "de": "Deutsch",
    "en": "German"
  },
  "language.english": {
    "de": "Englisch",
    "en": "English"
  },
  "connection.retrying": {
    "de": "Wiederverbindung, Versuch",
    "en": "Reconnecting, attempt"
  },
  "connection.autoReconnect": {
    "de": "Bei Netzwerkfehlern automatisch wiederverbinden (max. 3 Versuche)",
    "en": "Reconnect after network failures (up to 3 attempts)"
  },
  "stream.controllerSafe": {
    "de": "Controllerfreundliche Vollansicht auf dem iPad bevorzugen",
    "en": "Prefer controller-safe expanded view on iPad"
  },
  "stream.controllerSafeHelp": {
    "de": "Vermeidet natives Safari-Vollbild, in dem RT Fokusprobleme verursachen kann. iPadOS-Leisten können sichtbar bleiben. Dies ist eine Umgehung, kein bestätigter Safari-Fix.",
    "en": "Avoids native Safari fullscreen, where RT can cause focus problems. iPadOS bars may remain visible. This is a workaround, not a confirmed Safari fix."
  },
  "stream.controllerSafeActive": {
    "de": "Controlleransicht statt nativem Safari-Vollbild aktiviert, um RT-Probleme zu umgehen.",
    "en": "Controller view opened instead of native Safari fullscreen to avoid RT issues."
  },
  "account.title": {
    "de": "Dein Konto",
    "en": "Your account"
  },
  "account.loading": {
    "de": "Wird geladen …",
    "en": "Loading …"
  },
  "account.refresh": {
    "de": "Konto und Freunde aktualisieren",
    "en": "Refresh account and friends"
  },
  "account.unavailable": {
    "de": "Diese API-Funktion ist für diese Sitzung nicht verfügbar.",
    "en": "This API feature is unavailable for this session."
  },
  "account.networkUnavailable": {
    "de": "Die API-Antwort ist nicht lesbar. Netzwerk oder Browserfreigabe prüfen.",
    "en": "The API response is unreadable. Check the network or browser access."
  },
  "account.apiHelp": {
    "de": "Diese Listen verwenden lesende Parsec-Aufrufe. Nicht verfügbare Funktionen werden angezeigt; Konto- und Freundesdaten gelangen nicht in den Diagnosebericht.",
    "en": "These lists use read-only Parsec requests. Unavailable features are shown; account and friend data are not included in diagnostic reports."
  },
  "account.showAvatars": {
    "de": "Profilbilder der Hostbesitzer von Parsec laden",
    "en": "Load host owners' profile images from Parsec"
  },
  "friends.title": {
    "de": "Freunde",
    "en": "Friends"
  },
  "friends.empty": {
    "de": "Keine Freunde gemeldet.",
    "en": "No friends reported."
  },
  "hosts.onlineReported": {
    "de": "Von Parsec als online gemeldet",
    "en": "Reported online by Parsec"
  },
  "hosts.offlineReported": {
    "de": "Von Parsec als offline gemeldet",
    "en": "Reported offline by Parsec"
  },
  "hosts.statusUnknown": {
    "de": "Online-Status nicht gemeldet",
    "en": "Online status not reported"
  },
  "hosts.build": {
    "de": "Host-Version",
    "en": "Host version"
  },
  "hosts.updatedAt": {
    "de": "Zuletzt erfolgreich aktualisiert:",
    "en": "Last successfully refreshed:"
  },
  "quality.constantFps": {
    "de": "Konstante FPS beim Host anfordern",
    "en": "Request constant FPS from the host"
  },
  "quality.startMuted": {
    "de": "Neue Verbindungen stumm starten",
    "en": "Start new connections muted"
  },
  "quality.rememberStream": {
    "de": "Letzte Stream-Einstellungen und Stummschaltung merken",
    "en": "Remember stream settings and mute state"
  },
  "pointer.title": {
    "de": "Touch, Zoom und Maus",
    "en": "Touch, zoom and mouse"
  },
  "pointer.mode": {
    "de": "Touch-Modus",
    "en": "Touch mode"
  },
  "pointer.direct": {
    "de": "Direkte Touch-Maus",
    "en": "Direct touch mouse"
  },
  "pointer.touchpad": {
    "de": "Touchpad",
    "en": "Touchpad"
  },
  "pointer.sensitivity": {
    "de": "Mausempfindlichkeit",
    "en": "Mouse sensitivity"
  },
  "pointer.gestures": {
    "de": "Kurz tippen: Linksklick. Lang drücken und bewegen: Ziehen. Mit zwei Fingern tippen: Rechtsklick. Mit zwei Fingern verschieben: Scrollen. Finger auseinanderziehen: Zoom.",
    "en": "Tap: left click. Hold and move: drag. Two-finger tap: right click. Move two fingers: scroll. Pinch: zoom."
  },
  "pointer.zoom": {
    "de": "Bild vergrößern",
    "en": "Zoom image"
  },
  "pointer.panX": {
    "de": "Bildausschnitt horizontal",
    "en": "Horizontal view position"
  },
  "pointer.panY": {
    "de": "Bildausschnitt vertikal",
    "en": "Vertical view position"
  },
  "pointer.resetZoom": {
    "de": "Zoom zurücksetzen",
    "en": "Reset zoom"
  },
  "pointer.lock": {
    "de": "Relative Maus aktivieren",
    "en": "Enable relative mouse"
  },
  "pointer.unavailable": {"de": "Pointer Lock ist in diesem Browser nicht verfügbar. Touchpad kann weiterhin ohne Pointer Lock verwendet werden.", "en": "Pointer Lock is unavailable in this browser. Touchpad can still be used without it."},
  "pointer.locked": {
    "de": "Relative Maus aktiv. Zum Beenden Escape drücken.",
    "en": "Relative mouse active. Press Escape to leave."
  },
  "pointer.requested": {
    "de": "Relative Maus angefordert. Der Browser entscheidet über die Freigabe.",
    "en": "Relative mouse requested. The browser decides whether to grant it."
  },
  "pointer.denied": {"de": "Pointer Lock wurde nicht gewährt. Maus und Browser-Berechtigung prüfen; Touchpad bleibt verfügbar.", "en": "Pointer Lock was not granted. Check the mouse and browser permission; touchpad remains available."},
  "pointer.unlocked": {
    "de": "Relative Maus beendet.",
    "en": "Relative mouse ended."
  },
  "keyboard.show": {
    "de": "Tastatur und Sondertasten öffnen",
    "en": "Open keyboard and special keys"
  },
  "keyboard.close": {
    "de": "Tastatur schließen",
    "en": "Close keyboard"
  },
  "keyboard.text": {
    "de": "Text an den PC senden",
    "en": "Send text to the PC"
  },
  "keyboard.layoutHelp": {
    "de": "Texteingabe unterstützt lateinische ASCII-Buchstaben, Ziffern und einfache Satzzeichen als Tastendrücke. Das Tastaturlayout des Hosts bestimmt die Ausgabe. Sondertasten funktionieren direkt.",
    "en": "Text input supports ASCII letters, numbers and basic punctuation as key presses. The host keyboard layout determines the output. Special keys work directly."
  },
  "keyboard.unsupported": {
    "de": "Dieser Text enthält noch nicht unterstützte Zeichen und wurde nicht gesendet. Verwende dafür eine Hardwaretastatur.",
    "en": "This text contains unsupported characters and was not sent. Use a hardware keyboard for them."
  },
  "keyboard.paused": {
    "de": "Keine Eingabe gesendet: Stream fehlt oder Eingaben sind pausiert.",
    "en": "No input sent: no stream or input is paused."
  },
  "display.title": {
    "de": "Monitor",
    "en": "Monitor"
  },
  "display.waiting": {
    "de": "Monitorauswahl wird erst verfügbar, wenn der Host eine gültige Displayliste sendet.",
    "en": "Monitor selection becomes available only when the host sends a valid display list."
  },
  "display.available": {
    "de": "Vom Host gemeldete Monitore. Ein Wechsel ist eine Anfrage an den Host.",
    "en": "Monitors reported by the host. Switching sends a request to the host."
  },
  "display.unavailable": {
    "de": "Keine gültige Displayliste oder kein verfügbarer Steuerkanal.",
    "en": "No valid display list or no available control channel."
  },
  "display.requested": {
    "de": "Monitorwechsel angefordert; ob der Host ihn ausführt, muss im Stream geprüft werden.",
    "en": "Monitor switch requested; check the stream to confirm that the host applies it."
  },
  "controller.allowRumble": {
    "de": "Kurze Controller-Vibration erlauben, falls Host und Browser sie unterstützen",
    "en": "Allow short controller vibrations if supported by the host and browser"
  },
  "statistics.queue": {
    "de": "Decoder-Warteschlange",
    "en": "Decoder queue"
  },
  "statistics.hostEncode": {
    "de": "Host-Encodezeit",
    "en": "Host encode time"
  },
  "statistics.transportRtt": {
    "de": "Transport-RTT (keine Gesamtlatenz)",
    "en": "Transport RTT (not end-to-end latency)"
  },
  "pip.show": {
    "de": "Bild-in-Bild versuchen",
    "en": "Try picture-in-picture"
  },
  "pip.help": {
    "de": "Experimentell: nur das Videobild. Audio und Weiterbetrieb im Hintergrund werden dadurch nicht garantiert.",
    "en": "Experimental: video only. This does not guarantee audio or continued background operation."
  },
  "pip.unavailable": {
    "de": "Bild-in-Bild ist in diesem Browser oder ohne Stream nicht verfügbar.",
    "en": "Picture-in-picture is unavailable in this browser or without a stream."
  },
  "pip.denied": {
    "de": "Bild-in-Bild wurde nicht freigegeben. Falls die Vorschau läuft, kannst du erneut auf den Knopf tippen.",
    "en": "Picture-in-picture was not granted. If the preview is playing, you can tap the button again."
  },
  "pip.active": {
    "de": "Bild-in-Bild angefordert. Die Ausführung im Hintergrund bleibt vom Browser abhängig.",
    "en": "Picture-in-picture requested. Background execution remains controlled by the browser."
  },
  "capabilities.title": {
    "de": "Browser- und Protokollfunktionen",
    "en": "Browser and protocol capabilities"
  },
  "capabilities.check": {
    "de": "Lokale Browserfunktionen prüfen",
    "en": "Check local browser capabilities"
  },
  "capabilities.protocolLimits": {
    "de": "HEVC-Streaming ist experimentell. Remote-Zwischenablage, Freundschaftsanfragen, serverseitiger Sitzungswiderruf und Teams/SSO sind noch nicht implementiert. Decoder- oder Browser-Unterstützung allein bestätigt diese Funktionen nicht.",
    "en": "HEVC streaming is experimental. Remote clipboard, friend requests, server-side session revocation and Teams/SSO are not implemented yet. Decoder or browser support alone does not confirm these features."
  },
  "capabilities.hevcDecoder": {
    "de": "Browser meldet H.265-Decoder",
    "en": "Browser reports an H.265 decoder"
  },
  "capabilities.localHaptics": {
    "de": "Lokaler Controller meldet Vibrationsfunktion",
    "en": "Local controller reports haptic support"
  },
  "common.yes": {
    "de": "Ja",
    "en": "Yes"
  },
  "common.no": {
    "de": "Nein",
    "en": "No"
  },
  "account.moreAvailable": {
    "de": "Weitere Einträge werden von der API gemeldet; die Liste ist möglicherweise unvollständig.",
    "en": "The API reports more entries; this list may be incomplete."
  }
};
