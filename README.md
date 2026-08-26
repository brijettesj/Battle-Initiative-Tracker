# ⚔️ Dungeon Master's Battle Tracker 🐉

A single-file combat tracker for D&D 5e, built for running a fight at the table. Portraits sit in a
row in initiative order the way *Baldur's Gate 3* shows them, and you drag them to rearrange the order
mid-battle.

No install, no build step, no server. Open `index.html` in any browser.

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
  one-click answer. The prompts can be switched off.

**Rounds and turns**
- The fight sits at **Round 0** until you press *Start Battle*. Both reset buttons return you there.
- `Space` or `→` advances the turn, `←` steps back. The round counter advances on its own.

**Health**
- Click a health bar and type `-7` for damage, `+4` for healing, `22` to set it exactly, or `t8` to
  grant 8 temporary HP. Damage eats temporary HP first, as the rules have it.
- At 0 HP a portrait greys out and shows a skull, but keeps its place in the order.

**Conditions**
- All 15 official conditions plus concentrating, blessed, hasted, slowed and raging.
- Give one a duration and the counter ticks down at the end of that character's turn, dropping the
  condition automatically at zero. Leave it blank and it stays until you remove it.

**Battle log**
- A scrollable history under the initiative row: every hit, heal, temp HP, condition, reorder, turn
  and roster change, newest first and grouped under sticky round headers.
- Answers "who took damage five turns ago?" without anyone relying on memory.
- Folds away with a click; **Clear log** wipes the history without touching the fight.

**Per-character detail**
- Hover a portrait and click ✎ for AC, temporary HP, Dex modifier, notes and conditions.
- Notes show as a 📝 chip on the card and in full in the banner on that character's turn.

**Icons**
- Pick from a fantasy emoji set, or upload your own art — it's cropped square and stored with the
  character.
- The *Icons* setting switches between your device's own emoji and one shared downloaded set, so the
  tracker can look identical across devices.

## Layout

| File | What it is |
| --- | --- |
| `index.html` | The entire application — markup, styles and script in one file. |

The only external request is a Google Fonts stylesheet for the Cinzel display face, plus the optional
emoji font if you turn on *Universal* icons. Both fall back cleanly with no internet.
