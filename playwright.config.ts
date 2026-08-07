import type { PlaywrightTestConfig } from '@playwright/test';

const localBaseUrl = 'http://localhost:3377';
// Set in CI to point at the Vercel preview deployment for this commit instead
// of building and serving the app locally - see .github/workflows/ci.yml.
const remoteBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

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
		video: 'retain-on-failure',
		// Only set against a Vercel deployment with Deployment Protection on -
		// see https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation.
		...(bypassSecret && {
			extraHTTPHeaders: {
				'x-vercel-protection-bypass': bypassSecret,
				'x-vercel-set-bypass-cookie': 'true'
			}
		})
	}
};

export default config;
