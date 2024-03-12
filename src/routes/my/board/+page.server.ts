import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { getBoardByUserId } from '$lib/server/db/boardDb.js';

export const prerender = false;

export const load = async ({ locals }) => {
	return pipe(
		getBoardByUserId({
			userId: locals.user!.id
		}),
		TE.match(
			() => {
				throw new Error('Board not found');
			},
			(board) => ({ board })
		)
	)();
};
