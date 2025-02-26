import { error, json } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { getUser } from '$lib/server/db/userDb';
import { getSharedNotes } from '$lib/server/db/notesDb';

export const GET = async ({ locals }) => {
	return pipe(
		TE.Do,
		TE.bind('user', () =>
			getUser({ id: locals.user!.id, includeBoards: true, includeNotes: true })
		),
		TE.bind('sharedNotes', ({ user }) => getSharedNotes({ userId: user.id })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(data) =>
				json({
					board: data.user.boards[0],
					sharedNotes: data.sharedNotes
				})
		)
	)();
};
