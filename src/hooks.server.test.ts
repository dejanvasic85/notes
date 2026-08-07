import { describe, it, vi, expect } from 'vitest';
import { errAsync, okAsync } from 'neverthrow';

import { getSession, clearAuthCookie } from '$lib/auth/session';
import { createError } from '$lib/server/errorFactory';

import { handleSessionCookie } from './hooks.server';

vi.mock('$lib/auth/session', () => ({
	getSession: vi.fn(),
	clearAuthCookie: vi.fn(),
	setAuthCookie: vi.fn()
}));

const getSessionMock = vi.mocked(getSession);
const clearAuthCookieMock = vi.mocked(clearAuthCookie);

const buildEvent = (pathname: string) => ({
	request: new Request(`http://localhost${pathname}`),
	cookies: {},
	locals: {} as { user?: unknown }
});

const resolve = vi.fn(async () => new Response('ok'));

describe('handleSessionCookie', () => {
	it('redirects to login for a private route when there is no session cookie', async () => {
		getSessionMock.mockReturnValue(errAsync(false));

		const response = await handleSessionCookie({
			event: buildEvent('/my/account') as any,
			resolve
		} as any);

		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe('/api/auth/login?returnUrl=/my/account');
	});

	it('redirects to login for a private route when the session cookie is invalid or expired', async () => {
		getSessionMock.mockReturnValue(
			errAsync(createError('AuthorizationError', 'Failed to verify user cookie'))
		);

		const response = await handleSessionCookie({
			event: buildEvent('/my/account') as any,
			resolve
		} as any);

		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe('/api/auth/login?returnUrl=/my/account');
		expect(clearAuthCookieMock).toHaveBeenCalled();
	});

	it('resolves normally for a public route with an invalid session cookie', async () => {
		getSessionMock.mockReturnValue(
			errAsync(createError('AuthorizationError', 'Failed to verify user cookie'))
		);

		const response = await handleSessionCookie({
			event: buildEvent('/privacy') as any,
			resolve
		} as any);

		expect(response.status).toBe(200);
	});

	it('sets locals.user and resolves when the session is valid', async () => {
		const user = { id: 'uid_123', name: 'Bob', email: 'bob@example.com' };
		getSessionMock.mockReturnValue(okAsync(user as any));
		const event = buildEvent('/my/account');

		await handleSessionCookie({ event: event as any, resolve } as any);

		expect(event.locals.user).toEqual(user);
	});
});
