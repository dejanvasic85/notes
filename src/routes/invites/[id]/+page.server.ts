import { error } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { mapToApiError } from '$lib/server/mapApi.js';
import { acceptInvite } from '$lib/server/services/userService.js';
import { getUser } from '$lib/server/db/userDb.js';

export const load = async ({ params, locals }) => {
	const inviteId = params.id;
	const acceptedBy = locals.user!;

	return pipe(
		acceptInvite(inviteId, { id: acceptedBy.id, email: acceptedBy.email }),
		TE.flatMap((connection) =>
			getUser({ id: connection.userFirstId, includeBoards: false, includeNotes: false })
		),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => {
				throw error(err.status, err.message);
			},
			(friend) => ({
				connected: true,
				friendName: friend.name
			})
		)
	)();
};
