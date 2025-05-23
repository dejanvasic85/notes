import { json, type RequestHandler } from '@sveltejs/kit';
import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { getUser } from '$lib/server/db/userDb';
import { mapToApiError } from '$lib/server/apiResultMapper';

export const GET: RequestHandler = async ({ locals }) => {
	return pipe(
		{ id: locals.user!.id },
		({ id }) => getUser({ id }),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(user) => json(user)
		)
	)();
};
