import type { PlaywrightTestConfig } from '@playwright/test';

/*
 * Offline mode can only be tested against a production build: `build` and
 * `prerendered` from `$service-worker` are empty in dev, so the dev server
 * precaches nothing and an offline reload would fail on vite's module
 * requests rather than on anything the service worker controls.
 *
 * In CI, PLAYWRIGHT_TEST_BASE_URL points this at the Vercel preview
 * deployment for the commit under test - see .github/workflows/ci.yml - which
 * is already a production build, so there's no need to build a second one
 * here. Locally there's no such deployment, so this builds and serves its own
 * copy with `vite preview`. Kept separate from playwright.config.ts because
 * that one runs `pnpm dev` instead, which wouldn't satisfy the production
 * build requirement above. Both default to port 3377 locally, since Auth0's
 * Allowed Callback URLs only cover that origin for local dev - anything else
 * cannot log in, which would put the authenticated board out of reach here.
 * Locally only one suite can hold the port at a time, and --strictPort makes
 * that a loud failure rather than a silent bump onto a port Auth0 will
 * reject; in CI the two suites are separate jobs on separate runners, so they
 * never contend regardless.
 */
const previewPort = 3377;
const buildTimeoutMs = 240_000;
const localBaseUrl = `http://localhost:${previewPort}`;
const remoteBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;

const config: PlaywrightTestConfig = {
	webServer: remoteBaseUrl
		? undefined
		: {
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
		baseURL: remoteBaseUrl || localBaseUrl,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	}
};

export default config;
