import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { getBoardByUserId } from '$lib/server/db/boardDb';
import { getSharedNotes } from '$lib/server/db/notesDb';
import { getFriends } from '$lib/server/services/userService';

export const prerender = false;

export const load = async ({ locals }) => {
	const boardPromise = pipe(
		TE.Do,
		TE.bind('board', () => getBoardByUserId({ userId: locals.user!.id })),
		TE.bind('friends', () => getFriends(locals.user!.id)),
		TE.bind('sharedNotes', () => getSharedNotes({ userId: locals.user!.id })),
		TE.match(
			() => {
				throw new Error('Board not found');
			},
			(result) => ({
				board: result.board,
				friends: result.friends,
				sharedNotes: result.sharedNotes
			})
		)
	)();

	return {
		boardPromise
	};
};
