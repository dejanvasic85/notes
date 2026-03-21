import { error, json, type RequestHandler } from '@sveltejs/kit';

import { getPendingReceivedInvites, getPendingSentInvites } from '$lib/server/db/userDb';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { getFriends } from '$lib/server/services/userService';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	const user = locals.user;

	const result = await getPendingSentInvites(user.id)
		.andThen((pendingSentInvites) =>
			getPendingReceivedInvites(user.email!).map((pendingReceivedInvites) => ({
				pendingSentInvites,
				pendingReceivedInvites
			}))
		)
		.andThen(({ pendingSentInvites, pendingReceivedInvites }) =>
			getFriends(user.id).map((friends) => ({
				pendingSentInvites,
				pendingReceivedInvites,
				friends
			}))
		)
		.mapErr(mapToApiError);

	return result.match(
		(data) => json(data),
		(err) => error(err.status, { message: err.message })
	);
};
