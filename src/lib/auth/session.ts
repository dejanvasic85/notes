import { ResultAsync, errAsync } from 'neverthrow';
import type { Cookies } from '@sveltejs/kit';
import { SignJWT, jwtVerify } from 'jose';

import type { User, ServerError } from '$lib/types';
import { withError } from '$lib/server/errorFactory';
import { SESSION_SECRET } from '$env/static/private';

const COOKIE_NAME = 'session';
const COOKIE_DURATION_SECONDS = 60 * 60 * 24 * 7;

const getSecretKey = () => new TextEncoder().encode(SESSION_SECRET);

export const setAuthCookie = async (cookies: Cookies, user: User) => {
	const cookieValue = await new SignJWT({ ...user })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(`${COOKIE_DURATION_SECONDS}s`)
		.sign(getSecretKey());
	cookies.set(COOKIE_NAME, cookieValue, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: COOKIE_DURATION_SECONDS,
		path: '/'
	});
};

export const clearAuthCookie = (cookies: Cookies) => {
	cookies.delete(COOKIE_NAME, { path: '/' });
};

export const getSession = (cookies: Cookies): ResultAsync<User, false | ServerError> => {
	const cookie = cookies.get(COOKIE_NAME);

	if (!cookie) {
		return errAsync(false as false | ServerError);
	}

	return ResultAsync.fromPromise(
		jwtVerify(cookie, getSecretKey()).then(({ payload }) => payload as unknown as User),
		withError('AuthorizationError', 'Failed to verify user cookie')
	);
};
