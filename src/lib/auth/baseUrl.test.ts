import { describe, expect, test, vi } from 'vitest';

import { getAuthBaseUrl } from './baseUrl';

vi.mock('$env/static/public', () => ({
	PUBLIC_BASE_URL: 'https://notes-dev.vasic.com.au'
}));

describe('getAuthBaseUrl', () => {
	test.each([
		['https://notes-i4q7stq7j-dejan-vasics-projects.vercel.app', true],
		['https://notes.vasic.com.au', true],
		['https://notes-dev.vasic.com.au', true],
		['http://localhost:3377', true],
		['http://localhost', true],
		['https://notes-dejan-vasics-projects.vercel.app.evil.com', false],
		['https://evil.com', false],
		['https://notes.vasic.com.au.evil.com', false],
		['http://notes.vasic.com.au', false]
	])('%s is used as-is: %s', (origin, isAllowed) => {
		const result = getAuthBaseUrl(new URL(`${origin}/api/auth/login`));

		expect(result).toBe(isAllowed ? origin : 'https://notes-dev.vasic.com.au');
	});
});
