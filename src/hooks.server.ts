import type { Handle } from '@sveltejs/kit';

import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { verifyToken } from '$lib/auth/verifyToken';
import { getOrCreateUserByAuth } from '$lib/services/userService';

const getTokenFromHeader = (authHeader: string) => authHeader.split(' ')[1];

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader) {
		const accessToken = getTokenFromHeader(authHeader);
		const decodedToken = await verifyToken(accessToken);
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

	const response = await resolve(event);
	return response;
};
