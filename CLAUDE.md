# Technical Requirements

- Svelte Kit v2 and Svelte v5
- Tailwind CSS V4
- Accessibility (a11y) AA compliant
- Responsive design (mobile-first)
- Clean and maintainable code with re-usable Svelte components
- Ensure the use of typescript alias @/ for imports

Please read all the latest documentation for (Svelte Kit)[svelte.dev/llms.txt] and Tailwind CSS to ensure you are familiar with the latest features and best practices before implementing any new features or changes in these areas.

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

- Be sure to run `npm run check` when you’re done making a series of code changes
- Use `npm run format` whenever the format is not correct
- Prefer running single tests, and not the whole test suite, for performance

# Dependency management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs
