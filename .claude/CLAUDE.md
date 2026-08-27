# Technical Requirements

- Svelte Kit v2 and Svelte v5
- Tailwind CSS v4
- Accessibility (a11y) AA compliant
- Responsive design (mobile-first)
- Write clean, maintainable code with reusable Svelte components
- Use the `@/` TypeScript alias for imports

Before you build or change anything in these areas, read the latest [Svelte Kit](https://svelte.dev/llms.txt) and Tailwind CSS documentation. This keeps you current with their latest features and best practices.

# Design

- Invoke the `design-system` skill before any UI work — components, Tailwind classes, `app.css`, layouts, or picking a colour, radius, shadow, size or animation timing
- The design language lives in `docs/design-system/` (`README.md` for the rules, `tokens.css` for values, `preview.html` for the visual reference)
- It supersedes the generic `frontend-design` skill for this repo

# Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (e.g. `import { foo } from 'bar'`)
- Each Svelte component should declare its own prop types using TypeScript, in the same file
- In Svelte component files, declare constants outside the component function
- Use camelCase for variable and function names
- Use PascalCase for Svelte components
- Avoid inline styles; use Tailwind CSS classes instead
- Avoid the `any` type in TypeScript, and avoid casting with `as`
- Declare constant values and objects with `const`
- For constant objects, use camelCase suffixed with `Value` instead of CAPS
- Name event handlers with the `handle` prefix (e.g. `handleClick`)
- Only write code comments when the code isn't clear, and keep them concise. Don't comment out code
- Avoid magic numbers and strings; use named constants instead
- End every file with a line break
- Keep components and modules under 200 lines. Split larger ones into separate components to manage complexity
- Name TypeScript files in camelCase, e.g. `myService.ts`

# Workflow

- Stop the dev server before starting new work, and restart it when you're done. Don't leave a stale server running on port 3377, and don't let Vite switch to another port. The Auth0 callback only allows port 3377, so login fails on any other port
- Run `pnpm check` after finishing a series of code changes
- Run `pnpm format` whenever the formatting is off
- Prefer running single tests over the whole suite, for speed
- After finishing a set of changes, push to a branch and open a PR (`gh pr create`). Don't leave work uncommitted or hand it back unpushed
- After pushing to a PR branch, watch the CI pipeline (`gh pr checks <pr-number>`) until it finishes, and confirm it passes. If a check fails, pull the logs (`gh run view <run-id> --log-failed`) and fix the root cause, then push again. Don't hand back a PR with failing or still-pending checks

# Dependency management

- Find the latest version of a package before adding it
- Avoid deprecated packages or APIs
