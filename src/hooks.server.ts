import type { Handle } from '@sveltejs/kit';

import { verifyToken } from '$lib/verifyToken';

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('authorization');
	if (authHeader) {
		const isValidToken = await verifyToken(authHeader.split(' ')[1]);
		if (!isValidToken) {
			throw new Error('Invalid token');
		}
	}

	const response = await resolve(event);

	return response;
};
