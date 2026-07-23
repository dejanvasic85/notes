import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
