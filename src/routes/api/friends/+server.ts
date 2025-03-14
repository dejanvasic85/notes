import { error, json, type RequestHandler } from '@sveltejs/kit';
import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';
import { getPendingReceivedInvites, getPendingSentInvites } from '$lib/server/db/userDb';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { getFriends } from '$lib/server/services/userService';

export const GET: RequestHandler = ({ locals }) => {
	if (!locals.user) {
		return error(401, { message: 'Unauthorized' });
	}

	const user = locals.user;
	return pipe(
		TE.Do,
		TE.bind('pendingSentInvites', () => getPendingSentInvites(user.id)),
		TE.bind('pendingReceivedInvites', () => getPendingReceivedInvites(user.email!)),
		TE.bind('friends', () => getFriends(user.id)),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(data) => json(data)
		)
	)();
};
