import type { RequestHandler } from '@sveltejs/kit';

import { clearAuthCookie } from '$lib/auth/session';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from '$env/static/private';

export const GET: RequestHandler = ({ cookies, request }) => {
	clearAuthCookie(cookies);
	const url = new URL(request.url);
	const returnTo = encodeURIComponent(url.origin);
	const location = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${returnTo}`;

	return new Response('Logout', {
		status: 302,
		headers: {
			location
		}
	});
};
