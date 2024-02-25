import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import type { RequestHandler } from '@sveltejs/kit';

import { getToken } from '$lib/auth/getToken';
import type { AuthUserProfile } from '$lib/types';
import { getOrCreateUser } from '$lib/server/services/userService';
import { tryVerifyToken } from '$lib/auth/verifyToken';
import { setAuthCookie } from '$lib/auth/session';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const csrfState = cookies.get('csrfState');

	if (state !== csrfState || !code) {
		return new Response('Invalid state', { status: 403 });
	}

	return pipe(
		getToken({ code }),
		TE.flatMap((token) => tryVerifyToken<AuthUserProfile>(token.id_token)),
		TE.flatMap((authUser) => getOrCreateUser({ authId: authUser.sub, authUserProfile: authUser })),
		TE.flatMap((user) => setAuthCookie(cookies, user)),
		TE.match(
			(err) => new Response(`Failed to get token. Err: ${err}`, { status: 500 }),
			() => {
				cookies.delete('csrfState', { path: '/' });
				return new Response(null, { status: 302, headers: { location: '/' } });
			}
		)
	)();
};
