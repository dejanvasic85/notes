# Notes Design System

> **Status: proposed.** Nothing here is wired into the app yet. `src/routes/app.css` still
> holds the old tokens. Adoption is tracked as separate pieces of work — see
> [Adoption path](#adoption-path).

The direction is **"cool room, warm paper."** The interface around your notes is quiet and
slightly cool; the notes themselves are warm. That contrast is the whole idea — the only
colour that shouts on screen is colour the user chose.

| File                 | What it is                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `README.md`          | This document. The rules, in prose. Source of truth.                                                     |
| `tokens.css`         | The machine-readable token layer, written as a Tailwind v4 `@theme` block.                               |
| `preview.html`       | Visual reference — swatches, type specimens, screen mockups. Open it in a browser; it is self-contained. |
| `check-contrast.mjs` | Verifies every contrast claim below. `node docs/design-system/check-contrast.mjs`                        |

---

## 1. Colour

### Neutrals

The ground is a **violet-leaning grey**, never a true neutral and never warm cream. It sits
cooler than the notes on purpose, so warm pastels advance and the chrome recedes.

| Token                 | Light     | Dark      | Use                             |
| --------------------- | --------- | --------- | ------------------------------- |
| `--color-canvas`      | `#efedf1` | `#141317` | App background                  |
| `--color-paper`       | `#fcfbfd` | `#1c1a20` | Cards, sheets, bars             |
| `--color-raised`      | `#ffffff` | `#26232c` | Menus, popovers above paper     |
| `--color-ink`         | `#1d1b21` | `#e8e5ec` | Primary text                    |
| `--color-ink-muted`   | `#5c5764` | `#a29daa` | Secondary text, meta            |
| `--color-ink-faint`   | `#6e6979` | `#948f9c` | Placeholder, disabled           |
| `--color-line`        | `#ddd9e3` | `#322e3a` | Borders                         |
| `--color-line-soft`   | `#e9e6ed` | `#272430` | Dividers, hairlines             |
| `--color-line-strong` | `#6e6979` | `#948f9c` | Borders on interactive elements |

All three text levels clear 4.5:1 on **all three** surfaces (canvas, paper, raised), so any
of them is safe anywhere without checking.

`--color-line` is tuned for dividers and sits well below the 3:1 that WCAG 1.4.11 requires
for non-text UI. **Anything a user can click or that conveys state — a colour swatch, a
toggle, a checkbox — uses `--color-line-strong`.** Plain `--color-line` is for separators
and for borders that are decorative rather than load-bearing.

This replaces the four grey families currently in circulation — `gray-*`, `slate-*`, the
custom `dark-*` set, and the one-off hexes `#f5f5f7` / `#e0e0e2`.

### Accent

| Token                   | Light     | Dark      | Use                                             |
| ----------------------- | --------- | --------- | ----------------------------------------------- |
| `--color-accent`        | `#7d5aa6` | `#9b7bc4` | Fills                                           |
| `--color-accent-strong` | `#654484` | `#b49ad4` | Hover/pressed, and accent text on paper (7.5:1) |
| `--color-accent-soft`   | `#ece5f5` | `#2b2338` | Tint fills, active nav pill                     |
| `--color-accent-ring`   | `#b79ad6` | `#9b7bc4` | Focus rings                                     |
| `--color-on-accent`     | `#ffffff` | `#1d1b21` | Text/icons on an accent fill                    |
| `--color-on-danger`     | `#ffffff` | `#1d1b21` | Text/icons on a danger fill                     |

> **Never hardcode `text-white` on a coloured fill.** The dark-mode accent is a _light_
> violet, so white on it is 3.5:1 and fails AA. `--color-on-accent` flips to near-black in
> dark mode, which is 4.9:1. `--color-on-danger` does the same for danger fills — the dark
> danger is a light salmon where white drops to 2.6:1. These are the only tokens where the
> light and dark values are not simply lighter/darker versions of each other.

**Why plum and not terracotta.** The visual references lean orange, but `#8f5bbd` is the
logo, the PWA `theme_color` in `static/manifest.json`, and the installed app icon. Moving to
terracotta means re-cutting the brand. This accent is the same hue family, dropped in
saturation so it can appear far more often without ever raising its voice.

### Semantic

Semantic colour is **separate from the accent** and is never used decoratively.

| Token             | Light     | Dark      | Use              |
| ----------------- | --------- | --------- | ---------------- |
| `--color-success` | `#376e50` | `#7fb894` | Saved, confirmed |
| `--color-warning` | `#8b5f20` | `#d3a45f` | Unsaved changes  |
| `--color-danger`  | `#a9452f` | `#dd8a76` | Delete, errors   |

Each has a `-soft` companion for tinted backgrounds, and each foreground clears 4.5:1 on
its own `-soft` ground.

### Note colours

Six, hand-mixed rather than stock Tailwind `*-100` (which skew cool and plasticky). Every
light shade clears **13:1** against `--color-ink` and every dark shade clears **10:1**
against the dark ink, so note text is AA at any size without per-colour text overrides.

| Name   | Light     | Dark      |
| ------ | --------- | --------- |
| Butter | `#fbf0cf` | `#3a3220` |
| Blush  | `#fadfdc` | `#3b2725` |
| Sage   | `#dfeadb` | `#242e23` |
| Sky    | `#dce7f4` | `#1f2a36` |
| Lilac  | `#e8e2f3` | `#2a2436` |
| Clay   | `#f7e3d5` | `#3a2a20` |

Replaces `src/lib/colours.ts`, which currently pairs `rose-100` in light with `red-900` in
dark — a hue mismatch.

---

## 2. Type

Two faces, split by job.

- **Poppins 500/600 — display only.** Keeps the brand voice, and its wide geometric
  lowercase is an asset at large sizes. Not used below 20px.
- **Figtree 400–600 — everything else.** Body, UI, labels, meta. Narrower and far more
  readable at text sizes, which is where Poppins currently costs the app.

Both **self-hosted**. This replaces the render-blocking Google Fonts `@import` at the top of
`app.css` and fixes a live bug: Poppins loads at 400/500 today while `font-bold` (700) is
used in several places, so those bolds are currently synthesised by the browser.

| Role           | Face        | Size     | Line height | Tracking           |
| -------------- | ----------- | -------- | ----------- | ------------------ |
| `text-display` | Poppins 600 | 2.75rem  | 1.05        | −0.03em            |
| `text-title`   | Poppins 600 | 1.75rem  | 1.15        | −0.02em            |
| `text-heading` | Figtree 600 | 1.125rem | 1.35        | −0.01em            |
| `text-body`    | Figtree 400 | 1rem     | 1.6         | —                  |
| `text-small`   | Figtree 400 | 0.875rem | 1.55        | —                  |
| `text-label`   | Figtree 500 | 0.75rem  | 1.4         | +0.06em, uppercase |

### Measure

`--container-measure` is **65ch**, exposed as `max-w-measure`. WCAG 1.4.8 caps blocks of text
at 80 characters; 65 is the classic measure and what `@tailwindcss/typography` already
applies via `prose`.

**Containers that hold running text are sized from the measure, not from the viewport.** The
note editor sheet is `max-w-3xl` for exactly this reason — it used to be `w-4/5`, which on a
wide screen left the text hugging the left edge of a mostly empty panel and made a
deliberate measure look like a broken layout.

Where an editing surface has to be both measured _and_ clickable, let the surface fill its
container and constrain the children instead — see the `.tiptap > *` rule in `app.css`. That
keeps the whole area clickable and lets the focus ring outline what's actually being edited.

Headings get `text-wrap: balance`.

---

## 3. Space, radius, elevation

### Spacing

4px base: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Card padding is 16px on mobile, 24px from
`md` up. Sections are separated by 48px.

### Radius

| Token              | Value | Use                             |
| ------------------ | ----- | ------------------------------- |
| `--radius-chip`    | 8px   | Tags, small inputs              |
| `--radius-control` | 12px  | Buttons, inputs, menu items     |
| `--radius-card`    | 18px  | Note cards, panels              |
| `--radius-sheet`   | 26px  | Bottom sheets, floating bars    |
| `--radius-pill`    | 999px | Nav pill, toolbar, filter chips |

**One rule: a container is never less round than its children.** A 12px button inside an
18px card is correct. Today's 12px buttons inside 8px cards read as an accident.

### Elevation

`--shadow-rest` · `--shadow-card` · `--shadow-lifted` · `--shadow-float` · `--shadow-sheet`

Shadows are **tinted with the ink hue, never pure black** — that alone is most of what
separates a calm interface from a harsh one.

In dark mode shadow barely reads, so elevation is carried by **progressively lighter
surfaces plus `--color-line`**. The tokens swap; components don't change.

---

## 4. Dark mode and theming

The token layer defines a **complete dark ramp** — neutrals, accent, semantic, all six note
colours, and shadows. The app supports three states: **System / Light / Dark**, with System
the default.

### How the three states resolve

`data-theme` on `<html>` carries an explicit choice. **System stamps nothing** — the absent
attribute is the signal, and `prefers-color-scheme` does the rest in pure CSS.

| State  | `data-theme` | Resolves via                                            |
| ------ | ------------ | ------------------------------------------------------- |
| System | absent       | `@media (prefers-color-scheme: dark)`                   |
| Light  | `light`      | `:not([data-theme='light'])` excludes it from the query |
| Dark   | `dark`       | the attribute selector                                  |

Leaving System attribute-less buys two things: it cannot flash (no JS decides it), and it
keeps following the OS while the page is open with no `matchMedia` listener.

### The dark variant

This is a **design-system-level decision**, because it changes how every `dark:` utility in
the codebase resolves. It must match **both** conditions, mirroring how the tokens
themselves are scoped:

```css
/* app.css */
@custom-variant dark {
	&:where([data-theme='dark'], [data-theme='dark'] *) {
		@slot;
	}

	@media (prefers-color-scheme: dark) {
		&:where(:root:not([data-theme='light']), :root:not([data-theme='light']) *) {
			@slot;
		}
	}
}
```

**Tailwind's documented one-liner —
`@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))` — is wrong
here.** It resolves `dark:` on the attribute only, so in System mode on a dark OS the tokens
flip from the media query while every `dark:` utility stays light: dark chrome, light note
pastels. Keep the variant and the token block in step, condition for condition.

### Rules for whoever touches this

- **A colour that must change with the theme belongs in a token, not a `dark:` utility.**
  Tokens flip once, centrally. `dark:` is for the handful of cases with no token — the note
  pastels (`dark:bg-note-*-dark`) and `dark:prose-invert`.
- **Never put `@media (prefers-color-scheme: dark)` in a component's scoped `<style>`.** A
  media query does not respond to the attribute, so that component silently disagrees with
  the rest of the app in explicit Light or Dark.
- The pre-paint script in `src/app.html` must stay **blocking and inline**, before
  `%sveltekit.head%`. Deferred or bundled runs too late and the wrong theme paints first.
  It mirrors `themeStorageKey` and `themeAttribute` in `src/lib/theme.ts` by hand — it
  cannot import — so change both together.
- `color-scheme` is wired in §10 for all three states, so native form controls and
  scrollbars follow the choice rather than only the OS.
- The manifest's `theme_color` is a single static value and can't follow the toggle; it
  stays on the light brand colour.

### Where the switcher lives

The **variant strategy above belongs to the design system.** The switcher **UI** is a
product feature: `src/components/ThemeSwitcher.svelte`, rendered in `/my/account` alongside
the display-name form.

---

## 5. Controls

- Every interactive control is **at least 44px tall**. The current `size="sm"` toolbar
  buttons are 32px.
- Hover shifts **background**, not scale. The current `hover:scale-105` makes adjacent
  buttons jitter and does nothing for keyboard users.
- `:focus-visible` gets a 2px `--color-accent-ring` outline at 2px offset, applied at the
  base layer. **This is currently an accessibility bug** — `lib/button.ts` sets
  `focus:outline-hidden` with no replacement, so keyboard focus is invisible app-wide.
- Press is the **only** place a spring easing is allowed.

---

## 6. Layout

### Board

Cards **size to their content** in masonry columns — two on mobile, filling on desktop —
with a max height and a soft mask fade for long notes. The current fixed `h-note` (18rem) /
`w-note` (16rem) sizing gives a three-word note the same box as a long one, which is why
the board reads as mostly empty space.

Each card carries a date line (`text-label`), the title, a content preview, and — when
shared — avatars plus a "Shared" chip.

### Navigation

- **Mobile:** a floating pill detached from the bottom edge, with the create button as a
  separate accent square beside it. Must clear the home indicator with
  `env(safe-area-inset-bottom)` — there is **zero** `env()` usage in the app today.
- **Desktop:** the rail stays.

### Editor toolbar

A **floating pill pinned to the bottom** of the editor sheet, tracking the software keyboard
via `visualViewport`.

Four reasons this beats the current top strip:

1. **Reach.** The pill sits in the natural thumb arc; the strip sits at the top of a sheet.
2. **It stops disappearing.** The strip lives inside the scrolling body, so it leaves the
   screen as soon as you write past the fold.
3. **Targets.** 44px instead of 32px.
4. **Room to grow.** Bullets, checklists and undo already exist in TipTap's StarterKit but
   have nowhere to live in a strip.

Contents: colour swatch · bold · italic · underline · bullet list · checklist. Active marks
render as a **solid filled pill** that slides between positions rather than two separate
fades.

---

## 7. Motion

**Specified, not yet built.** The rule that makes motion feel calm rather than busy: things
**arrive slowly and leave quickly.** Only direct manipulation may overshoot — content never
bounces.

### Easings

| Token          | Curve                             | Use                                                              |
| -------------- | --------------------------------- | ---------------------------------------------------------------- |
| `--ease-enter` | `cubic-bezier(.22, 1, .36, 1)`    | Anything appearing. Long settle reads as calm.                   |
| `--ease-exit`  | `cubic-bezier(.4, 0, 1, 1)`       | Anything leaving. Accelerate away; never linger.                 |
| `--ease-move`  | `cubic-bezier(.65, 0, .35, 1)`    | Travel between two known states.                                 |
| `--ease-press` | `cubic-bezier(.34, 1.56, .64, 1)` | Direct manipulation only. The single place overshoot is allowed. |

Durations: `--duration-tap` 100ms · `--duration-fast` 160ms · `--duration-base` 240ms ·
`--duration-slow` 360ms · `--duration-sheet` 420ms.

**Write durations as `duration-(--duration-fast)`, not `duration-fast`.** `--ease-*` is a
Tailwind theme namespace, so `ease-move` compiles; `--duration-*` is **not**, so
`duration-fast` matches no utility and Tailwind silently emits nothing. The parenthesis
form resolves to `transition-duration: var(--duration-fast)`. The square-bracket form
(`duration-[--duration-fast]`) is also wrong — it emits the raw text, not a `var()`.

### Choreography

| Moment       | Timing      | Behaviour                                                                                               |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| Board load   | 240ms enter | Cards fade up 8px at scale .98, staggered 30ms in reading order. Caps at 8 cards.                       |
| Open a note  | 420ms enter | The card's colour and radius expand into the sheet — the note grows rather than a panel flying over it. |
| Close        | 240ms exit  | Reverses, faster. The asymmetry is the point.                                                           |
| Toolbar mark | 240ms move  | The filled pill slides between icons instead of two fades.                                              |
| Button press | 100ms press | Scale to .94 then settle. Pairs with the existing 50ms haptic.                                          |
| FAB          | 360ms press | Icon rotates 90° from plus to close as the sheet opens.                                                 |
| Reorder      | 240ms move  | FLIP on surviving cards so neighbours slide rather than jump.                                           |
| Toast        | 240ms enter | Drops 12px and fades in at top centre, clearing the sticky header.                                      |
| Save         | 160ms move  | Label crossfades to a check, holds 800ms, returns. No spinner for sub-second work.                      |

**All of it sits behind `prefers-reduced-motion`,** which the app does not honour anywhere
today.

---

## 8. Known defects this system fixes

These are bugs, not preferences. Verified against the built CSS.

| Where                                                       | Problem                                                                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/lib/button.ts:4`                                       | `focus:outline-hidden` with no replacement — keyboard focus invisible app-wide                                          |
| `src/lib/button.ts:14`                                      | `dark:hover:darkHover` is not a Tailwind class; 0 matches in built CSS. Ghost buttons have no dark hover                |
| `src/components/Menu.svelte:114`                            | `.selected { border: 4px solid var(--primary) }` — the token is `--color-primary`, so this falls back to `currentColor` |
| `src/components/ProfileMenu.svelte:39`                      | `hover:bg-slate` has no shade → 0 matches; also two conflicting light hover backgrounds                                 |
| `src/routes/app.css`                                        | `--min-height-0…6` is the string `.25rem` split one character per line                                                  |
| `src/routes/privacy/+page.svelte:6`, `terms/+page.svelte:6` | `prose-lg` without the base `prose` class — typography is inert                                                         |
| `src/routes/app.css`                                        | Poppins loaded at 400/500 while `font-bold` (700) is used — faux bold                                                   |
| `package.json`                                              | `@fontsource/fira-mono` and `@neoconfetti/svelte` are never imported                                                    |
| `src/app.html`                                              | No `initial-scale=1`, no `viewport-fit=cover`, no `color-scheme`                                                        |
| Throughout                                                  | Zero `env(safe-area-inset-*)` usage; `h-screen` / `h-[90vh]` instead of `dvh`                                           |

---

## 9. Contrast verification

`.claude/CLAUDE.md` requires AA compliance, so the palette is checked rather than eyeballed:

```bash
node docs/design-system/check-contrast.mjs
```

It asserts **58 pairs** — every text level on every surface, both themes, plus accent,
semantic and all twelve note colours — against 4.5:1 for normal text. It exits non-zero on
failure, so it can be wired into CI once the tokens land in `app.css`.

**Re-run it after changing any colour token.** Three of the original values failed and were
caught this way:

| Token                                         | Was                   | Now                   | Problem                                                                             |
| --------------------------------------------- | --------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `--color-ink-faint` (light)                   | `#9a95a3`             | `#6e6979`             | 2.8:1 on paper — placeholder text is not exempt from AA, only disabled controls are |
| `--color-on-accent` (dark)                    | _(hardcoded white)_   | `#1d1b21`             | White on the light dark-mode accent is 3.5:1                                        |
| `--color-success` / `--color-warning` (light) | `#3f7d5c` / `#9a6a24` | `#376e50` / `#8b5f20` | 4.1:1 and 4.0:1 on their own soft grounds                                           |

Two thresholds are deliberately _not_ enforced: large text and non-text elements (borders,
focus rings) only need 3:1, and disabled controls are exempt under WCAG 1.4.3. The system
meets 4.5:1 everywhere anyway, which leaves headroom.

---

## Adoption path

Ordered so each step ships on its own and nothing is a big-bang rewrite.

1. **Land the token layer.** Drop the `@theme` block into `app.css` alongside the existing
   tokens. Nothing changes visually. Clear out the corrupt `--min-height-*` block and the
   dead dependencies.
2. **Fonts and focus.** Self-host Poppins, add Figtree, delete the render-blocking import.
   Add the `:focus-visible` ring at the base layer. Smallest diff, biggest accessibility win.
3. **Repaint the primitives.** Point `lib/button.ts`, `lib/colours.ts`, `Input` and `Note`
   at the new tokens. Swap `hover:scale-105` for a background shift. The whole app changes
   colour in one commit.
4. **Masonry board.** Retire fixed `h-note` / `w-note` for content-sized columns. Add the
   date line and shared chip.
5. **The floating toolbar.** Rebuild `Toolbar.svelte` as the pinned pill, wire it to
   `visualViewport`, add list/checklist commands. Needs real device testing.
6. **Theme switcher.** `@custom-variant dark`, the anti-FOUC script, and a System/Light/Dark
   control in `/my/account`.
7. **Motion.** Apply the choreography table behind `prefers-reduced-motion`. Last, because
   it most needs the rest to be settled.
