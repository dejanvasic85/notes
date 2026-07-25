---
name: design-system
description: 'The Notes design language — colour, type, spacing, radius, elevation, motion, and component rules. Use whenever writing or changing UI: Svelte components, Tailwind classes, app.css, layouts, or anything visual. Also use when picking a colour, a radius, a shadow, a font size, or an animation timing. Supersedes generic design guidance for this repo.'
user-invocable: true
---

# Notes Design System

## Outcome

UI changes that conform to one coherent system instead of adding another ad-hoc value.

## Source of truth

| File                                    | Read it when                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/design-system/README.md`          | You need the reasoning, the full token tables, or the component rules. **Read this before any non-trivial UI work.**                     |
| `docs/design-system/tokens.css`         | You need exact token names and values.                                                                                                   |
| `docs/design-system/preview.html`       | You want to see it — swatches, type specimens, screen mockups. Self-contained; open in a browser.                                        |
| `docs/design-system/check-contrast.mjs` | You changed a colour token. Run `node docs/design-system/check-contrast.mjs` — it asserts all 56 AA pairs and exits non-zero on failure. |

> **The system is proposed, not yet adopted.** `src/routes/app.css` still holds the old
> tokens (`--color-primary: #8f5bbd`, `--color-dark`, `--color-background`). Check which
> tokens actually exist before using a class name — see [Adoption state](#adoption-state).

## Before you write UI code

1. **Check `src/components/` for an existing component** — `Button`, `Input`, `Label`,
   `Dialog`, `UserAvatar`, `Skeleton`, `NoteList`, `NoteContainer`. Follow the existing
   pattern rather than writing bespoke markup. There is no `Card` or `Icon` primitive;
   icons come straight from `@lucide/svelte`.
2. **Read `docs/design-system/README.md`** for the area you're touching.
3. **Use a token, never a raw value.** If nothing fits, that is a design decision — raise
   it, don't invent a seventh grey.

## Non-negotiables

These hold regardless of which part of the system is adopted yet.

- **Focus is always visible.** Never `focus:outline-hidden` without a `:focus-visible`
  replacement. Invisible keyboard focus is an AA failure, and the repo currently has this
  bug in `src/lib/button.ts`.
- **44px minimum** for any interactive target.
- **Containers are never less round than their children.** A 12px button inside an 18px
  card is correct; the reverse is not.
- **Hover shifts background, not scale.** `hover:scale-105` jitters adjacent controls and
  does nothing for keyboard users.
- **Motion arrives slowly and leaves quickly.** Only direct manipulation (press, FAB) may
  overshoot. Content never bounces. Everything sits behind `prefers-reduced-motion`.
- **Semantic colour is separate from the accent** and is never decorative.
- **Never `text-white` on an accent fill.** Use `--color-on-accent`, which flips to
  near-black in dark mode — the dark accent is light, so white on it fails AA at 3.5:1.
- **Re-run `check-contrast.mjs` after touching any colour token.**
- **Both themes, every time.** Any new surface needs its dark counterpart. Style through
  tokens so the swap is automatic.
- **Respect the safe area** on anything pinned to a screen edge —
  `env(safe-area-inset-bottom)`. Use `dvh`, not `vh`.

## Adoption state

Before writing a class like `bg-paper` or `rounded-card`, confirm the token exists in
`src/routes/app.css`. If the token layer hasn't landed yet (step 1 of the adoption path),
either land it first or use the current tokens and note the follow-up.

Adoption order — each step ships on its own:

1. Token layer into `app.css`
2. Self-hosted fonts + `:focus-visible` ring
3. Repaint primitives (`lib/button.ts`, `lib/colours.ts`, `Input`, `Note`)
4. Masonry board
5. Floating editor toolbar
6. Theme switcher (`@custom-variant dark` + anti-FOUC script + System/Light/Dark control)
7. Motion

## Relationship to other guidance

This skill **supersedes** the generic `frontend-design` skill for this repo.
`frontend-design` is for greenfield aesthetics where no system exists; here one does.
Reach for `frontend-design` only when designing something genuinely outside the system —
a marketing page, an illustration — and even then keep the tokens.

## Verify

- `pnpm check` passes.
- `pnpm format` if formatting drifted.
- Any new colour, radius, shadow, size or timing traces back to a named token.
- The change looks right in **both** light and dark, and at mobile **and** desktop width.
