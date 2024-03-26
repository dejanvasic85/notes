import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { getInvite } from '$lib/server/db/userDb';
import { error } from '@sveltejs/kit';
import { mapToApiError } from '$lib/server/mapApi.js';

export const load = async ({ params, locals }) => {
	const inviteId = params.id;
	const email = locals.user?.email;

	return pipe(
		getInvite(inviteId, { friendEmail: email }),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => {
				throw error(err.status, err.message);
			},
			(invite) => ({
				id: invite.id
			})
		)
	)();
};
