# Roll Initiative

*A Dungeon Battle Tracker*

An initiative and combat tracker for tabletop roleplaying games, built for running a fight at the
table. Portraits sit in a row in initiative order, and you drag them to rearrange the order mid-battle.

The whole application is one HTML file with no build step and no server. It makes no network requests
at all: both typefaces and the logo are embedded in the file, so it looks and works the same offline.

## Running it

Double-click `index.html`. That's the whole setup.

Everything saves to the browser it's running in, so you can close the tab and pick the fight back up.
Note that each device keeps its own battle — a fight set up on a laptop won't appear on a tablet.

## What it does

**Launch**
- The dragon mark holds the screen for three seconds and then fades into the tracker.
- A tap, click or keypress skips it. The key that skips does not also advance the turn.

**Initiative order**
- Add players, allies and enemies with a name, side, AC and max HP.
- Leave initiative blank and it rolls a d20 + Dex modifier; type a number if the player rolled their own.
- Add several at once with the Qty field — five wolves come in as Wolf 1–5, each rolling separately.
- Drag any portrait left or right to rearrange the order. Whoever's turn it is stays their turn.
- Tap a portrait to jump the current turn to that character.
- When two combatants roll the same number, a prompt asks who goes first — with *Players first* as a
  one-click answer. The prompts can be switched off in Settings.

**Rounds and turns**
- The fight sits at **Round 0** until you press *Start Battle*. Both reset buttons return you there.
- Once the battle starts, whoever is up takes a spotlight above the order, drawn larger, with two
  buttons under it: **Attack** and **Finish turn**.
- *Attack* asks who took it (tick several for an area spell), the damage and any conditions it
  inflicts. With several targets the damage is the same for each, split equally (rounded down) or
  typed per target. `0` records a miss. The whole attack is one undo step.
- After an attack, a results panel lists everyone hit and animates each health bar down, with a red
  ghost of the lost chunk trailing behind.
- *Finish turn*, `Space` or `→` moves to the next combatant. If nothing happened during the turn it
  asks before skipping. `←` steps back. The round counter advances on its own.

**Health**
- Click a health bar and type `-7` for damage, `+4` for healing, `22` to set it exactly, or `t8` to
  grant 8 temporary HP. Damage eats temporary HP first, as the rules have it.
- At 0 HP a portrait greys out and shows a skull, but keeps its place in the order.

**Conditions**
- All 15 conditions from the reference document, plus concentrating, blessed, hasted, slowed and raging.
- Give one a duration and the counter ticks down at the end of that character's turn, dropping the
  condition automatically at zero. Leave it blank and it stays until you remove it.

**Battle log**
- A scrollable history in a rail beside the initiative row: every hit, heal, temp HP, condition,
  reorder, turn and roster change, newest first and grouped under sticky round headers.
- Answers "who took damage five turns ago?" without anyone relying on memory.
- Folds away with a click; **Clear** wipes the history without touching the fight.

**Per-character detail**
- Hover a portrait and click ✎ for AC, temporary HP, Dex modifier, notes and conditions.
- Notes show as a 📝 chip on the card and in full in the banner on that character's turn.

**Settings** — the ⚙ button in the top corner
- *Icons* switches between your device's own emoji and one shared downloaded set, so the tracker can
  look identical across devices. The shared set needs the internet once, then caches.
- *Behaviour* holds the tie prompts, the help text, the battle log rail and a reduce-motion switch.
- Every setting is remembered on the device, and undo never rolls one back.

**Rooms** — players follow the battle on their own devices
- The DM presses *Room* on the tracker, then *Open a room*, and reads out the five-character code.
- Players choose *Join Room* on the menu, or open `…/Battle-Initiative-Tracker/?room=CODE`, type the
  code and pick their character. Each character can only be picked by one device.
- On their own character's turn a player can *Attack* and *Finish turn*, and at any time they can
  type into their own health bar. Everything else is read-only on their device.
- Players see exact numbers for players and allies, but enemies only as *Unhurt*, *Wounded*,
  *Bloodied*, *Near death* or *Down*. The DM's notes and damage lines in the log are not sent.
- The DM's device stays in charge: a player's action is applied there, so it shows in the DM's log
  and undo takes it back. A reload on either side picks the room back up. *Close room* ends it.
- Rooms stay hidden until Firebase is set up; see [Multiplayer rooms](#multiplayer-rooms) below.

**Testing**
- Open `index.html?demo` to replace the board with a sample party and monsters at round 0, plus a
  sample campaign. The `?demo` is dropped from the address once loaded, so a reload keeps the fight.

## Layout

| File | What it is |
| --- | --- |
| `index.html` | The entire application — markup, styles, embedded fonts and script in one file. |
| `build.js` | Copies `index.html` and `web/` into `www/`, the folder Capacitor packages. |
| `gradle.js` | Runs Gradle with the pinned JDK, on any platform or shell. |
| `capacitor.config.json` | App id, display name and native shell settings. |
| `package.json` | Capacitor dependencies and the build scripts below. |
| `logos/` | Source artwork. `ICON ONLY` is the splash mark, `ICON - TWO LINER` the full logo. |
| `resources/` | The two source images every launcher and store size is generated from. |
| `web/` | Manifest, service worker and icons that make `www/` installable from a browser. |
| `firebase/` | Security rules for the Realtime Database that rooms run on. |
| `dev/` | `rooms-server.js`, a local stand-in for Firebase for testing rooms (`npm run rooms:dev`). |
| `android/` | The native Android project, committed so an update builds on what shipped. |
| `ios/` | The native Xcode project. Created on a Mac, then committed, like `android/`. |
| `prototypes/` | Visual studies of the interface. Nothing here is built, packaged or deployed. |

## Multiplayer rooms

Rooms run on a free [Firebase](https://firebase.google.com) project, reached through its REST API
and event stream, so no SDK is added to `index.html`. Until the project's details are filled in,
the *Room* button and the *Join Room* banner stay hidden and the app makes no requests.

1. Create a Firebase project. Add a **Realtime Database** to it (locked mode is fine, the rules
   below replace it).
2. Under **Authentication → Sign-in method**, turn on **Anonymous**.
3. Replace the database rules with the contents of `firebase/database.rules.json`, either by pasting
   them into the console's *Rules* tab or with `firebase deploy --only database`.
4. Under **Project settings → General**, add a web app to get its API key. The key is not a secret:
   access is controlled by the rules.
5. In `index.html`, fill in `ROOMS_CFG` in the rooms section with the database URL
   (`https://<project>-default-rtdb.<region>.firebasedatabase.app` or
   `https://<project>-default-rtdb.firebaseio.com`) and the API key.

How it fits together: the DM's device writes a copy of the board to `rooms/CODE/view` after every
save, with enemy numbers, notes and damage lines taken out, and portraits written once each to
`rooms/CODE/art`. Players' devices stream that copy. What a player does is written to
`rooms/CODE/actions`, and the DM's device checks it (right character, right turn) before applying it.
Which device plays which character is in `rooms/CODE/claims`. The rules let only the device that
opened a room change it, let anyone signed in claim a free character or send an action, and let a
code be reused once its room is a day old.

**Testing without a Firebase project.** `npm run rooms:dev` starts a local server that serves the
app and stands in for Firebase, all in memory. It prints two addresses:

- On the DM's device, open the Wi-Fi address with `?roomsdev&demo` (for example
  `http://192.168.1.20:8787/?roomsdev&demo`), which also loads the sample battle. Then press
  *Resume Battle* and *Room*. Using the Wi-Fi address rather than `localhost` makes the room's join
  link work on phones.
- On each phone on the same Wi-Fi, open the same address with `?roomsdev`, choose *Join Room* and
  type the code.

`?roomsdev` is remembered by that browser, so after the first visit the plain address is enough.
`?roomsdev=off` turns it back off. On one computer, two tabs on the same address share an identity,
so use `localhost` in one and `127.0.0.1` in the other. The server copies the security rules by
hand, so once a real project exists, try the rules there too. If the Mac asks whether Node may
accept incoming connections, allow it, or phones cannot reach the server.

To use the Firebase emulators instead, run this in the browser console and reload:

```js
localStorage.setItem("dnd-rooms-dev", JSON.stringify({
  db: "http://127.0.0.1:9000/?ns=<project>", key: "any", auth: "http://127.0.0.1:9099"
}));
```

## Building the mobile app

The app is wrapped with [Capacitor](https://capacitorjs.com), which puts the same HTML file inside a
native shell and produces real Xcode and Android Studio projects.

```sh
npm install          # once
npm run add:android  # creates android/ (needs Android Studio)
npm run add:ios      # creates ios/ (macOS and Xcode only)

npm run open:android # rebuild www/ and open the native project
npm run open:ios
```

`npm run sync` rebuilds `www/` and pushes it into whichever native projects exist. Run it after every
change to `index.html`.

Before publishing, set `appId` in `capacitor.config.json` to a reverse-DNS identifier you control. It
cannot be changed after an app is first submitted to either store.

The `ios/` and `android/` folders are committed on purpose. They carry the app icon, the version
numbers and the store configuration, so a fresh clone can build the same app you last shipped.
Signing keys are the exception and are gitignored — never commit a `.jks`, `.keystore` or `.p12`.

### Shipping an update

Updates are the normal case; nothing about the app is frozen once it is live except the `appId`.

1. Edit `index.html`, then `npm run sync` to push the change into both native projects.
2. **Raise the version in both projects.** Each has two numbers: one people see and one the store
   uses to order uploads.
   - Android, in `android/app/build.gradle`: `versionName "1.0.1"` and `versionCode 2`.
   - iOS, in Xcode's General tab: *Version* `1.0.1` and *Build* `2`.
3. Rebuild the signed bundle or archive, upload it, and submit. **Every update is reviewed again**,
   usually within a day or two.

`versionCode` and the iOS *Build* number must increase on every single upload, including a re-upload
of otherwise identical code. Both stores reject a build whose number has been seen before.

Roll out carefully rather than all at once. Google Play offers a staged rollout by percentage that
you can halt, and Apple offers a phased release over seven days that you can pause. Neither can pull
an update back off a phone that already installed it, so the pause is what limits the damage.

### Changing the icon

The icon is an ordinary asset, so it changes in any update.

```sh
mkdir -p resources                       # keep a 1024x1024 icon.png here
npx @capacitor/assets generate           # writes every size into ios/ and android/
npm run sync
```

Commit the regenerated icons, raise the version, rebuild and submit as above.

One asymmetry between the stores. Google Play has a separate 512×512 listing icon, edited in the
Play Console, which changes within hours and needs no new build. Apple takes the listing icon from
the app bundle itself, so on iOS a new icon always means a new version going through review.

### Testing it

**In a browser**, on any phone at the table, no install and no accounts: serve the folder and open it,
or share the published link. Served over HTTPS from a real host, a floating **Install** button appears
and adds it to the home screen, after which it runs offline. Push to `main` deploys `www/` to GitHub
Pages, which is switched on and serving at <https://brijettesj.github.io/Battle-Initiative-Tracker/>.

```sh
npm run build
npx http-server www -p 8080
```

**On an Android device.** Android Studio bundles Java 25, but Gradle 8.14 and Android Gradle Plugin
8.13 cannot run on it — the build fails with `Unsupported class file major version 69`. Build on Java
21 instead. Put one in `tools/jdk-21` (Temurin works; `tools/` is gitignored) and point the build at it:

```sh
npm run apk           # debug APK, sideloadable
npm run apk:release   # release bundle for the Play Console
```

`gradle.js` finds `tools/jdk-21` on its own, so nothing needs setting first.

The debug APK lands in `android/app/build/outputs/apk/debug/`. For Android Studio, set File ▸ Settings
▸ Build, Execution, Deployment ▸ Build Tools ▸ Gradle ▸ Gradle JDK to a 21; Studio can download one.

To open the project in the IDE:

```sh
npm run open:android          # rebuilds www/ and opens the project
```

Then Run to sideload onto a connected phone, or Build ▸ Generate Signed Bundle for a release. The
project is already at version `1.0.0`, build `1`, with the app name **Roll Initiative** and every
launcher and splash size generated from `resources/`.

**On an iPhone or iPad.** The `ios/` folder does not exist yet. It has to be created on a Mac,
because the step that makes it runs CocoaPods and Xcode, neither of which exists on Windows. Once it
is created, commit it, for the same reason `android/` is committed.

Putting the app on your own device needs no paid membership. A free Apple ID signs a build that runs
for **seven days**, after which the app refuses to open until you run it from Xcode again. That is
the right way to look at it on a phone. The $99-a-year Apple Developer Program only becomes necessary
for TestFlight, for the App Store, and for installs that do not expire — enrol when you get there,
because approval takes a day or two as an individual and longer as a company, which also needs a
D-U-N-S number.

Install on the Mac first:

- **Xcode**, from the Mac App Store. It is a large download, so start it before anything else.
- **Command Line Tools** — `xcode-select --install`.
- **CocoaPods** — `sudo gem install cocoapods`, or `brew install cocoapods` if you use Homebrew.
- **Node 20 or newer**, matching what the Pages workflow builds with.

Open Xcode once and let it finish installing components, then agree to the licence with
`sudo xcodebuild -license accept`. Now, in a clone of this repository:

```sh
npm install
npm run add:ios                  # creates ios/, runs pod install
npx @capacitor/assets generate --ios   # icons and splash from resources/
npm run open:ios                 # rebuilds www/ and opens Xcode
```

In Xcode, on the **App** target:

1. **Signing & Capabilities** — tick *Automatically manage signing*, then add your Apple ID under
   Xcode ▸ Settings ▸ Accounts and pick it as the Team. Leave the bundle identifier at
   `com.rollinitiative.app`, which matches `capacitor.config.json` and cannot change after a first
   App Store submission.
2. **General ▸ Supported Destinations** — keep both *iPhone* and *iPad*. The tracker's two-column
   layout already suits a tablet propped on the table, and dropping iPad later is easier than adding
   it after a release.
3. Plug the phone in, trust the Mac when it asks, pick it as the run destination and press Run.
4. The first launch fails with an untrusted-developer error. On the phone, go to Settings ▸ General ▸
   VPN & Device Management, tap your Apple ID and trust it, then launch the app again.

After any change to `index.html`, run `npm run sync` to push it into the iOS project, then Run again.

One thing to know before this goes further than your own phone: state lives in `localStorage`, and
iOS clears WKWebView storage under pressure. Moving it to `@capacitor/preferences` matters more on
iOS than on Android, and it is the first item in the list below.

### Still to do before a store submission

- **Storage.** State currently lives in `localStorage`, which a webview can clear under storage
  pressure. Move it to `@capacitor/preferences` so a campaign roster cannot vanish.
- ~~**A privacy policy at a public URL.**~~ Done. `privacy.html` ships in `www/`, so it is served at
  <https://brijettesj.github.io/Battle-Initiative-Tracker/privacy.html>. That is the URL to paste into
  both store listings.
- **Store screenshots**, taken on a device or simulator rather than a desktop browser.

## Licences and attribution

The interface is an 8-bit pixel-art look, and its three typefaces are embedded, all under the SIL Open
Font License 1.1: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) for labels,
buttons and numbers, [VT323](https://fonts.google.com/specimen/VT323) for names, body text and the
battle log, and [Jacquarda Bastarda 9](https://fonts.google.com/specimen/Jacquarda+Bastarda+9) for the
blackletter title lines. Every icon is drawn from the device's emoji and scaled up as a pixel sprite.

Rules references come from the System Reference Document 5.1, used under the
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
licence. This project is not affiliated with, sponsored by, or endorsed by any game publisher.
