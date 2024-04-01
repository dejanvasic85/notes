import { error } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { mapToApiError } from '$lib/server/mapApi';
import { acceptInvite } from '$lib/server/services/inviteService';

export const load = async ({ params, locals }) => {
	const inviteId = params.id;
	const acceptedBy = locals.user!;

	return pipe(
		acceptInvite(inviteId, { id: acceptedBy.id, email: acceptedBy.email }),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => {
				throw error(err.status, err.message);
			},
			(result) => ({
				connected: true,
				friendName: result.invitedBy.name
			})
		)
	)();
};
