# Technical Requirements

- Svelte Kit v2 and Svelte v5
- Tailwind CSS V4
- Accessibility (a11y) AA compliant
- Responsive design (mobile-first)
- Clean and maintainable code with re-usable Svelte components
- Ensure the use of typescript alias @/ for imports

Please read all the latest documentation for (Svelte Kit)[svelte.dev/llms.txt] and Tailwind CSS to ensure you are familiar with the latest features and best practices before implementing any new features or changes in these areas.

# Design

- Invoke the `design-system` skill before any UI work — components, Tailwind classes, `app.css`, layouts, or picking a colour, radius, shadow, size or animation timing
- The design language lives in `docs/design-system/` (`README.md` for the rules, `tokens.css` for values, `preview.html` for the visual reference)
- It supersedes the generic `frontend-design` skill for this repo

# Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Each Svelte component should declare its own prop types using TypeScript within the same file
- Svelte component files should have constants declared outside the component function
- Use camelCase for variable and function names
- Use PascalCase for Svelte components
- Avoid use of inline styles, prefer Tailwind CSS classes
- Avoid using `any` type in Typescript or casting with as
- Declare constant values and objects using `const`
- Constant values that are objects, do not use CAPS for the variable name, use camelCase instead suffixed with 'Value'
- Event handlers should be named with the `handle` prefix (e.g. `handleClick`)
- Only write code comments when the code is not clear and keep it conscise, avoid commenting out code
- Avoid magic numbers and strings, use constants instead
- Each file should have line break at the end
- Try to limit components and modules up to 200 lines and split in to different components to manage complexity
- Typescript files should be camelCase e.g. myService.ts

# Workflow

- Always stop the dev server before starting new work, and restart it when you're done. Don't leave a stale server running on port 3377 and don't let vite bump to another port — the Auth0 callback is only whitelisted for 3377, so anything on a different port cannot log in
- Be sure to run `pnpm check` when you’re done making a series of code changes
- Use `pnpm format` whenever the format is not correct
- Prefer running single tests, and not the whole test suite, for performance
- After finishing a set of changes, push to a branch and open a PR (`gh pr create`) rather than leaving work uncommitted or handing it back unpushed
- After pushing to a PR branch, watch the CI pipeline (`gh pr checks <pr-number>`) until it finishes and make sure it's passing. If a check fails, pull the logs (`gh run view <run-id> --log-failed`), fix the root cause, and push again — don't leave a PR with red CI or hand it back as done while checks are still failing or pending.

# Dependency management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs
