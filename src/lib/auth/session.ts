import { taskEither as TE } from 'fp-ts';
import type { Cookies } from '@sveltejs/kit';
import type { User, ServerError } from '$lib/types';
import { withError } from '$lib/server/createError';

export const setAuthCookie = (cookies: Cookies, user: User): TE.TaskEither<ServerError, void> => {
	return TE.tryCatch(
		async () => {
			cookies.set('session', JSON.stringify(user), {
				httpOnly: true,
				sameSite: 'lax',
				// 1 week
				maxAge: 60 * 60 * 24 * 7,
				path: '/'
			});
		},
		withError('AuthorizationError', 'Failed to set user cookie')
	);
};
