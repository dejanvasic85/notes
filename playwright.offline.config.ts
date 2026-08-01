import type { PlaywrightTestConfig } from '@playwright/test';

/*
 * Offline mode can only be tested against a production build: `build` and
 * `prerendered` from `$service-worker` are empty in dev, so the dev server
 * precaches nothing and an offline reload would fail on vite's module
 * requests rather than on anything the service worker controls.
 *
 * Kept separate from playwright.config.ts so the everyday suite keeps running
 * against `pnpm dev` on the Auth0-whitelisted port 3377 and stays fast.
 */
const previewPort = 4173;
const buildTimeoutMs = 240_000;

const config: PlaywrightTestConfig = {
	webServer: {
		command: `pnpm build && pnpm preview --port ${previewPort} --strictPort`,
		reuseExistingServer: false,
		port: previewPort,
		timeout: buildTimeoutMs,
		stdout: 'pipe',
		stderr: 'pipe'
	},
	testDir: 'tests-offline',
	workers: 1,
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL: `http://localhost:${previewPort}`,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	}
};

export default config;
