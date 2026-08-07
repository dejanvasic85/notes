import type { PlaywrightTestConfig } from '@playwright/test';

const localBaseUrl = 'http://localhost:3377';
const remoteBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;

const config: PlaywrightTestConfig = {
	webServer: remoteBaseUrl
		? undefined
		: {
				command: 'pnpm dev',
				reuseExistingServer: true,
				port: 3377,
				stdout: 'pipe',
				stderr: 'pipe'
			},
	testDir: 'tests',
	workers: 1,
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL: remoteBaseUrl || localBaseUrl,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	}
};

export default config;
