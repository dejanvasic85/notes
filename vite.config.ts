import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

const sentryOrg = 'vasic-org';
const sentryProject = 'my-notes';
const vercelEnvironment = process.env.VERCEL_ENV;
const vercelDeployUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sentrySvelteKit({
			org: sentryOrg,
			project: sentryProject,
			authToken: process.env.SENTRY_AUTH_TOKEN,
			release: {
				// Only Vercel builds set VERCEL_ENV, so local/CI builds skip deploy registration.
				deploy: vercelEnvironment ? { env: vercelEnvironment, url: vercelDeployUrl } : false
			}
		}),
		sveltekit()
	],
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
