import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { getBoard, updateBoard } from '$lib/server/db/boardDb';
import { isBoardOwner } from '$lib/server/services/userService';
import { getUser } from '$lib/server/db/userDb';
import { parseRequest } from '$lib/server/parseRequest';
import { mapToApiError } from '$lib/server/mapApi';
import { BoardPatchSchema } from '$lib/types';

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	return pipe(
		TE.Do,
		TE.bind('changes', () =>
			parseRequest(request, BoardPatchSchema, 'Unable to parse BoardPatchSchema')
		),
		TE.bind('user', () =>
			getUser({ id: locals.user.id!, includeBoards: true, includeNotes: true })
		),
		TE.bind('board', () => getBoard({ id: params.id! })),
		TE.chain((params) => isBoardOwner(params)),
		TE.chain(({ changes, board }) => updateBoard({ ...board, ...changes })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(board) => json(board)
		)
	)();
};
