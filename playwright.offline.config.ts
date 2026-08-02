import type { PlaywrightTestConfig } from '@playwright/test';

/*
 * Offline mode can only be tested against a production build: `build` and
 * `prerendered` from `$service-worker` are empty in dev, so the dev server
 * precaches nothing and an offline reload would fail on vite's module
 * requests rather than on anything the service worker controls.
 *
 * Kept separate from playwright.config.ts because that one runs against
 * `pnpm dev` and this needs `vite preview`. Both use port 3377, since Auth0's
 * Allowed Callback URLs only cover that origin — anything else cannot log in,
 * which would put the authenticated board out of reach here. In CI the two
 * suites are separate jobs on separate runners, so they never contend; locally
 * only one can hold the port at a time, and --strictPort makes that a loud
 * failure rather than a silent bump onto a port Auth0 will reject.
 */
const previewPort = 3377;
const buildTimeoutMs = 240_000;

const config: PlaywrightTestConfig = {
	webServer: {
		command: `pnpm build && pnpm preview --port ${previewPort} --strictPort`,
		// Never adopt a stray server: a leftover `pnpm dev` on this port serves an
		// unbuilt app whose service worker precaches nothing, and every test here
		// would fail for a reason that has nothing to do with the code.
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
