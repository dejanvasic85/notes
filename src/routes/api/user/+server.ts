import { json, type RequestHandler } from '@sveltejs/kit';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';

import { getUser } from '$lib/db/userDb';
import { mapToApiError } from '$lib/mapApi';

export const GET: RequestHandler = async ({ locals }) => {
	return pipe(
		{ id: locals.user.id! },
		({ id }) => getUser({ id }),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(user) => json(user)
		)
	)();
};
