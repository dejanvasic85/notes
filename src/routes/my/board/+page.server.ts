import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { getBoardByUserId } from '$lib/server/db/boardDb.js';
import { getFriends } from '$lib/server/services/userService.js';

export const prerender = false;

export const load = async ({ locals }) => {
	return pipe(
		TE.Do,
		TE.bind('board', () => getBoardByUserId({ userId: locals.user!.id })),
		TE.bind('friends', () => getFriends(locals.user!.id)),
		TE.match(
			() => {
				throw new Error('Board not found');
			},
			(result) => ({ board: result.board, friends: result.friends })
		)
	)();
};
