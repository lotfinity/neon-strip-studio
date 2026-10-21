# Neon Strip Studio

A visual editor and screensaver player for a continuous WLED neon strip, with Windows, GNOME Linux, and Android players.

## Downloads

Get the installable packages from the [latest GitHub release](https://github.com/lotfinity/neon-strip-studio/releases/latest). You do not need Node.js or a compiler to use those packages.

| Device | Release asset | Start here |
| --- | --- | --- |
| Windows x86-64 | `NeonStrip-Windows.zip` | Extract the entire ZIP; open `NeonStripStudio.exe`. Run the included `install-windows.ps1` when ready to select the `.scr` screensaver. |
| GNOME Linux x86-64 | `NeonStrip-GNOME-x64.tar.gz` | Extract; open `NeonStripStudio`. Use `sh install-gnome.sh` for the optional idle integration. |
| Android 8+ | `NeonStrip-Android.apk` | Install the APK, open the editor, import your design, and select Neon Strip in Android screensaver settings. |

The JSON design is shared across all three players. Edit on one device, choose **Save design**, transfer that file, and choose **Load design** on the other devices. Downloading the repository's source ZIP does not install the screensaver; use the release assets above.

**Initial personal test release:** Windows startup and browser editing, recording, replay, and video export were checked. Android and GNOME packages were built but have not been tested on their target devices. The Android APK is debug-signed; the Windows binaries are unsigned. The physical WLED connection has not yet been verified; stream handling was tested with a local synthetic source. No recorded physical LED data is bundled. Offline mode uses a demo until you save your own recording.

Source is published for access and inspection; no open-source license has been granted (`UNLICENSED`). Bundled runtime dependencies retain their own licenses.

## Default strip

Version 1.0.1 uses the supplied `my-neon-strip.json` profile as its factory default: the edited perimeter and infinity, glow 0.95, brightness 0.65, and 60 fps. Existing saved designs are preserved. After upgrading, choose **Reset shape** for the new geometry, or **Load design** with the release's `my-neon-strip.json` to apply the complete profile. New installs use it automatically.

One editable, connected 150-group neon strip: 120 perimeter groups followed by 30 groups for the connecting lead and infinity. The initial geometry is an approximation of the supplied photos and 172 × 35 cm design concept. Edit to match the finished strip; starting corner/direction are not yet confirmed.

## Edit and share

Open NeonStripStudio on Windows or Linux, or open the Android app. The web editor also works by opening web/index.html in a modern browser. Edit shape reveals draggable curve points. Double-click a curve to add a point, select a point and press Delete to remove it. Endpoints cannot be deleted. Moving the perimeter end also moves the inner section's start. Undo covers shape/settings edits. Select the section to change its LED offset or direction. Use Portrait to orient the strip for a tall screen. Reset shape restores the original shape only.

Use Save design to export my-neon-strip.json. Transfer that file to each device and Load design there. Layout, settings, and any recording travel together. Local changes are saved on that device. This is an offline/local application, with no cloud account or service.

Connect requests the actual WLED Peek stream at the controller address. The preview must contain exactly 150 groups. Record live colors captures up to two minutes of real data. Stop recording, then Save design to include that recording. The player reconnects automatically; if the controller is unavailable it loops the saved recording. Without a recording it uses a clearly identified synthetic rainbow demo. Only one WLED client can receive Peek at once. Desktop monitors automatically share one local relay connection. To mirror live across different devices, run the optional preview-only relay from the source folder: node desktop/relay.cjs 192.168.1.164 --lan. Then set the WLED address in every player to the relay computer’s LAN address followed by :8787 (for example 192.168.1.50:8787). Keep that relay computer awake. The relay listens on your LAN only when you explicitly use --lan; it has no authentication and must not be forwarded to the Internet. A firewall may ask you to allow the port. It forwards only LED preview frames and never viewer lighting commands. Use recordings when the relay is unavailable.

## Windows

Extract the entire Windows package into a permanent folder. Open NeonStripStudio.exe to edit/import the design. Preview with its Fullscreen player button. NeonStrip.scr must stay beside the executable and all supporting files. Run install-windows.ps1 to select this screensaver for your Windows account and open Screen Saver Settings. This does not alter password-on-resume settings. Alternatively open Screen Saver Settings and select the SCR manually. /s starts it, /c opens the editor, and /p embeds a preview in the Settings panel. Mouse movement, a click, or a key exits the saver. It supports multiple monitors. The package is locally built and unsigned.

The packaged desktop app can also act as the relay without installing Node.js: run `NeonStripStudio.exe --relay --lan --target=192.168.1.164` on Windows, or `./NeonStripStudio --relay --lan --target=192.168.1.164` on Linux. It runs without a window; keep the process running for shared live playback. To stop it, end that relay process. The LAN relay is optional and is not started by the installer.

## GNOME Linux (x86-64)

Extract the Linux package to a permanent folder. Run chmod +x NeonStripStudio and ./NeonStripStudio to edit/import your design. --player starts fullscreen; --saver exits on input. Keep Electron's sandbox enabled. On distributions requiring a correctly installed chrome-sandbox helper, follow your distribution's Electron sandbox setup rather than adding --no-sandbox. Normal distribution libraries for Electron are required.

Run sh install-gnome.sh to add an editor shortcut and a per-user idle monitor for the next login. For immediate testing run python3 gnome-idle.py. It starts the saver after 120 seconds idle, and stops it on activity or GNOME locking. Requires python3, gdbus, GNOME Mutter's idle service, and the GNOME screensaver D-Bus service. Set NEON_IDLE_SECONDS to choose a different interval when running the monitor. The integration fails closed if GNOME services are unavailable. It does not change GNOME's blanking or lock policy: an existing earlier blank/lock timeout can hide the animation. This is an idle animation, not a lock screen replacement. Remove ~/.config/autostart/neon-strip-idle.desktop to stop future idle startup. Linux binaries and GNOME integration must be tested on the target Linux machine.

## Android 8+ (phone/tablet)

Install the provided APK, open Neon Strip Studio, and Load design. Tap Android screensaver settings, then select Neon Strip. Android/your device maker controls whether it activates while charging or docked and which settings are exposed. It is a real DreamService screensaver, not a home-screen live wallpaper. Devices with no Dream settings may only support fullscreen preview. Tap the dream to dismiss. APK is a debug-signed personal test build, not a Play Store release. This is not yet device-tested. Video export is disabled in the Android shell; use desktop.

## Video

Export 15-second video creates WebM in supported desktop browsers. Keep the window visible until export finishes. This is a recording of whichever live/offline mode is playing. Video can be played on compatible devices, but requires a video-screensaver player and does not remain synced to WLED. Transfer the JSON design for native editable playback instead.

## Build from source

Node.js 22+ and npm: npm ci, npm test, npm start. npm run pack:windows (Windows + .NET Framework C# compiler) or npm run pack:linux produces packages in the sibling packages directory. Electron version is pinned in package-lock.json. Platform packages target x86-64; Android uses the system WebView and has no CPU-specific native library.

Android: JDK 17, Android SDK platform 35/build-tools 35, and Gradle 8.13. Set ANDROID_HOME to your existing SDK and run ./android/gradlew -p android assembleDebug (Windows: android\gradlew.bat -p android assembleDebug). The build copies web/ into APK assets. The APK is under android/app/build/outputs/apk/debug/. Only INTERNET permission is requested. Cleartext networking is needed for WLED's unencrypted local WebSocket. No Internet endpoint is used by the player itself. Any LAN reachability/firewall rules still apply.

## Implementation

Buildless JavaScript editor, Catmull–Rom curves sampled by arc length, one WebGL mesh and a 150-pixel color texture. Glow is computed in a GPU shader; no per-LED blur calls. A reduced-glow Canvas renderer handles devices without WebGL. Default 30 fps with 20/60 options; pixel density capped for performance. Windows/Linux share the Electron host; Android uses WebView + DreamService. Layout and recording JSON is validated before use. Native installation/idle activation is never performed automatically by building the package.
