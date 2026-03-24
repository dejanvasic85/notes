import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { matchesPrivateRoute } from '$lib/auth/privateRoutes';
import { getSession, clearAuthCookie, setAuthCookie } from '$lib/auth/session';

const handleSessionCookie: Handle = async ({ event, resolve }) => {
	const url = new URL(event.request.url);
	const result = await getSession(event.cookies);

	if (result.isErr()) {
		const err = result.error;
		if (err !== false) {
			clearAuthCookie(event.cookies);
		}
		if (err === false && matchesPrivateRoute(url.pathname)) {
			return new Response('LoginRequired', {
				status: 302,
				headers: { location: `/api/auth/login?returnUrl=${url.pathname}` }
			});
		}
		return resolve(event);
	}

	await setAuthCookie(event.cookies, result.value);
	event.locals.user = result.value;
	return resolve(event);
};

export const handle = sequence(handleSessionCookie);
