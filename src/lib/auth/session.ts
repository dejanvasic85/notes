import { taskEither as TE } from 'fp-ts';
import type { Cookies } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

import type { User, ServerError } from '$lib/types';
import { withError } from '$lib/server/errorFactory';
import { SESSION_SECRET } from '$env/static/private';

const COOKIE_NAME = 'session';
const COOKIE_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const setAuthCookie = (cookies: Cookies, user: User) => {
	const cookieValue = jwt.sign(user, SESSION_SECRET);
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

export const getSession = (cookies: Cookies): TE.TaskEither<false | ServerError, User> => {
	const cookie = cookies.get(COOKIE_NAME);

	if (!cookie) {
		return TE.left(false);
	}

	return TE.tryCatch(
		async () => {
			return jwt.verify(cookie, SESSION_SECRET) as User;
		},
		withError('AuthorizationError', 'Failed to verify user cookie')
	);
};
