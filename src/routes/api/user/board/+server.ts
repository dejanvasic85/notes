import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { getUser } from '$lib/server/db/userDb';
import { getNoteOwners, getSharedNotes } from '$lib/server/db/notesDb';

export const GET: RequestHandler = async ({ locals }) => {
	const result = await getUser({ id: locals.user!.id, includeBoards: true, includeNotes: true })
		.andThen((user) =>
			getSharedNotes({ userId: user.id }).map((sharedNotes) => ({ user, sharedNotes }))
		)
		.andThen(({ user, sharedNotes }) =>
			getNoteOwners(sharedNotes.map((n) => n.id)).map((sharedNoteOwners) => ({
				user,
				sharedNotes,
				sharedNoteOwners
			}))
		)
		.mapErr(mapToApiError);

	return result.match(
		({ sharedNoteOwners, sharedNotes, user }) =>
			json({
				board: user.boards[0],
				sharedNotes,
				sharedNoteOwners
			}),
		(err) => error(err.status, { message: err.message })
	);
};
