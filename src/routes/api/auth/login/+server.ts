import type { RequestHandler } from '@sveltejs/kit';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const GET: RequestHandler = ({ cookies }) => {
	const csrfState = Math.random().toString(36).substring(7);
	cookies.set('csrfState', csrfState, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 1000,
		path: '/'
	});

	const query = {
		scope: 'openid profile email',
		response_type: 'code',
		client_id: AUTH0_CLIENT_ID,
		redirect_uri: `${PUBLIC_BASE_URL}/api/auth/callback`,
		state: csrfState
	};

	return new Response(null, {
		status: 302,
		headers: {
			location: `https://${AUTH0_DOMAIN}/authorize?${new URLSearchParams(query).toString()}`
		}
	});
};
