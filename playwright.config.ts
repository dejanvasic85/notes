import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run dev',
		reuseExistingServer: true,
		port: 3377,
		stdout: 'pipe',
		stderr: 'pipe'
	},
	testDir: 'tests',
	workers: 1,
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL: 'http://localhost:3377',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	}
};

export default config;
