import type { Handle } from '@sveltejs/kit';

import { createUser, getUserByAuthId, getAuthUserProfile } from '$lib/user';
import { verifyToken } from '$lib/verifyToken';

const getTokenFromHeader = (authHeader: string) => authHeader.split(' ')[1];

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader) {
		const accessToken = getTokenFromHeader(authHeader);
		const decodedToken = await verifyToken(accessToken);
		if (!decodedToken) {
			throw new Error('Invalid token');
		}

		const user = await getUserByAuthId(decodedToken.sub);
		if (user) {
			event.locals.user = user;
		} else {
			const authUserProfile = await getAuthUserProfile({ accessToken });
			event.locals.user = await createUser({ authUserProfile });
		}
	}

	const response = await resolve(event);
	return response;
};
