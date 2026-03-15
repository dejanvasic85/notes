import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			tailwindcss: resolve('./node_modules/tailwindcss/index.css')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		clearMocks: true
	}
});
