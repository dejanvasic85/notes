import { type RequestHandler, json, error } from '@sveltejs/kit';
import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';
import { mapToApiError } from '$lib/server/mapApi';
import { acceptInvite } from '$lib/server/services/friendService';

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user!;
	const body = await request.json();

	return pipe(
		acceptInvite(body.inviteId, { id: user.id, email: user.email! }),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(connection) => json(connection)
		)
	)();
};
