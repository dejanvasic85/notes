import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { either as E, taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { verifyToken } from '$lib/auth/verifyToken';
import { getSession, setAuthCookie } from '$lib/auth/session';
import { getOrCreateUserByAuth } from '$lib/server/services/userService';

const getTokenFromHeader = (authHeader: string) => authHeader.split(' ')[1];

const first: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader) {
		const accessToken = getTokenFromHeader(authHeader);
		const decodedToken = await verifyToken<{ sub: string }>(accessToken);
		if (!decodedToken) {
			throw new Error('Invalid token');
		}

		const result = await pipe(
			getOrCreateUserByAuth({ accessToken, authId: decodedToken.sub }),
			TE.map((user) => {
				event.locals.user = user;
			})
		)();

		if (E.isLeft(result)) {
			throw new Error('Failed to get or create user');
		}
	}

	return await resolve(event);
};

const privateRoutes = new Set(['/my-board', '/friends', '/friends/invite']);

const second: Handle = async ({ event, resolve }) => {
	return await pipe(
		getSession(event.cookies),
		TE.match(
			(left) => {
				const url = new URL(event.request.url);
				if (left === false && privateRoutes.has(url.pathname)) {
					return new Response('LoginRequired', {
						status: 302,
						headers: { location: `/api/auth/login?returnUrl=${url.pathname}` }
					});
				}
				return resolve(event);
			},
			(user) => {
				setAuthCookie(event.cookies, user);
				return resolve(event);
			}
		)
	)();
};

export const handle = sequence(first, second);
