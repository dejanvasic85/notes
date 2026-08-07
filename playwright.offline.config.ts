import type { PlaywrightTestConfig } from '@playwright/test';

const previewPort = 3377;
const buildTimeoutMs = 240_000;
const localBaseUrl = `http://localhost:${previewPort}`;
const remoteBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;

const config: PlaywrightTestConfig = {
	webServer: remoteBaseUrl
		? undefined
		: {
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
		baseURL: remoteBaseUrl || localBaseUrl,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	}
};

export default config;
