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
- `Space` or `→` advances the turn, `←` steps back. The round counter advances on its own.

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
- *Text size* scales the entire interface, portraits and badges included, not just the labels. Four
  steps from Small to Larger, for reading the tracker from across the table.
- *Accent colour* — Blood, Ember, Arcane, Verdant, Frost or Slate. One choice recolours every fill,
  badge, border and glow in the app.
- *Icons* switches between your device's own emoji and one shared downloaded set, so the tracker can
  look identical across devices. The shared set needs the internet once, then caches.
- *Behaviour* holds the tie prompts, the help text, the battle log rail and a reduce-motion switch.
- Every setting is remembered on the device, and undo never rolls one back.

## Layout

| File | What it is |
| --- | --- |
| `index.html` | The entire application — markup, styles, embedded font and script in one file. |
| `build.js` | Copies `index.html` into `www/`, the folder Capacitor packages. |
| `capacitor.config.json` | App id, display name and native shell settings. |
| `package.json` | Capacitor dependencies and the build scripts below. |
| `logos/` | Source artwork. `ICON ONLY` is the splash mark, `ICON - TWO LINER` the full logo. |
| `resources/` | The two source images every launcher and store size is generated from. |
| `web/` | Manifest, service worker and icons that make `www/` installable from a browser. |
| `android/` | The native Android project, committed so an update builds on what shipped. |

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
Pages once Pages is switched on under Settings ▸ Pages ▸ Source ▸ GitHub Actions.

```sh
npm run build
npx http-server www -p 8080
```

**On an Android device.** Android Studio bundles Java 25, but Gradle 8.14 and Android Gradle Plugin
8.13 cannot run on it — the build fails with `Unsupported class file major version 69`. Build on Java
21 instead. Put one in `tools/jdk-21` (Temurin works; `tools/` is gitignored) and point the build at it:

```sh
export JAVA_HOME="$PWD/tools/jdk-21"   # cmd: set JAVA_HOME=%CD%	oolsjdk-21
npm run apk                           # debug APK, sideloadable
npm run apk:release                   # release bundle for the Play Console
```

The debug APK lands in `android/app/build/outputs/apk/debug/`. For Android Studio, set File ▸ Settings
▸ Build, Execution, Deployment ▸ Build Tools ▸ Gradle ▸ Gradle JDK to a 21; Studio can download one.

To open the project in the IDE:

```sh
npm run open:android          # rebuilds www/ and opens the project
```

Then Run to sideload onto a connected phone, or Build ▸ Generate Signed Bundle for a release. The
project is already at version `1.0.0`, build `1`, with the app name **Roll Initiative** and every
launcher and splash size generated from `resources/`.

The iOS project is not created yet, because `npm run add:ios` only runs on macOS.

### Still to do before a store submission

- **Storage.** State currently lives in `localStorage`, which a webview can clear under storage
  pressure. Move it to `@capacitor/preferences` so a campaign roster cannot vanish.
- **A privacy policy at a public URL.** Both stores require one even though this app collects nothing.
- **Store screenshots**, taken on a device or simulator rather than a desktop browser.

## Licences and attribution

Two typefaces are embedded, both under the SIL Open Font License 1.1:
[Cormorant SC](https://fonts.google.com/specimen/Cormorant+SC) for headings and labels, chosen to match
the wordmark in the logo, and [Inter](https://rsms.me/inter/) for body text, health totals and the
battle log, where it stays readable at small sizes.

Rules references come from the System Reference Document 5.1, used under the
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
licence. This project is not affiliated with, sponsored by, or endorsed by any game publisher.
