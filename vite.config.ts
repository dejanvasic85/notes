import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		// Keep self-hosted fonts as separate cacheable files. Vite's 4KB default
		// would base64 the smaller subsets into the render-blocking stylesheet.
		assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined)
	},
	ssr: {
		noExternal: ['bits-ui', 'svelte-sonner']
	},
	server: {
		port: 3377
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		clearMocks: true
	}
});
