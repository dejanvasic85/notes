import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { matchesPrivateRoute } from '$lib/auth/privateRoutes';
import { getSession, setAuthCookie } from '$lib/auth/session';

const handleSessionCookie: Handle = async ({ event, resolve }) => {
	return await pipe(
		getSession(event.cookies),
		TE.match(
			(left) => {
				const url = new URL(event.request.url);
				if (left === false && matchesPrivateRoute(url.pathname)) {
					return new Response('LoginRequired', {
						status: 302,
						headers: { location: `/api/auth/login?returnUrl=${url.pathname}` }
					});
				}
				return resolve(event);
			},
			(user) => {
				setAuthCookie(event.cookies, user);
				event.locals.user = user;
				return resolve(event);
			}
		)
	)();
};

export const handle = sequence(handleSessionCookie);
