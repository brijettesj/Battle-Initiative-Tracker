# ⚔️ Tabletop Battle Tracker 🐉

An initiative and combat tracker for tabletop roleplaying games, built for running a fight at the
table. Portraits sit in a row in initiative order, and you drag them to rearrange the order mid-battle.

The whole application is one HTML file with no build step and no server. It makes no network requests
at all: the typeface is embedded in the file, so it looks and works the same offline.

## Running it

Double-click `index.html`. That's the whole setup.

Everything saves to the browser it's running in, so you can close the tab and pick the fight back up.
Note that each device keeps its own battle — a fight set up on a laptop won't appear on a tablet.

## What it does

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

### Still to do before a store submission

- **Storage.** State currently lives in `localStorage`, which a webview can clear under storage
  pressure. Move it to `@capacitor/preferences` so a campaign roster cannot vanish.
- **App icons and splash screens** at every size each store asks for.
- **A privacy policy at a public URL.** Both stores require one even though this app collects nothing.

## Licences and attribution

The interface uses [Inter](https://rsms.me/inter/), embedded under the SIL Open Font License 1.1.

Rules references come from the System Reference Document 5.1, used under the
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
licence. This project is not affiliated with, sponsored by, or endorsed by any game publisher.
