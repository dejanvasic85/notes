import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { isBoardOwner } from '$lib/server/services/userService';
import { getBoard, updateBoard } from '$lib/server/db/boardDb';
import { getUser } from '$lib/server/db/userDb';
import { parseRequest } from '$lib/server/requestParser';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { BoardPatchSchema } from '$lib/types';

export const GET = async ({ locals, params }) => {
	return pipe(
		getBoard({ id: params.id! }),
		TE.map((board) => isBoardOwner({ userId: locals.user!.id, board })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(data) => json(data)
		)
	)();
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	return pipe(
		TE.Do,
		TE.bind('changes', () =>
			parseRequest(request, BoardPatchSchema, 'Unable to parse BoardPatchSchema')
		),
		TE.bind('user', () =>
			getUser({ id: locals.user!.id, includeBoards: true, includeNotes: true })
		),
		TE.bind('board', () => getBoard({ id: params.id! })),
		TE.bind('boardAccess', ({ board }) => isBoardOwner({ board, userId: locals.user?.id })),
		TE.flatMap(({ changes, board }) => updateBoard({ ...board, ...changes })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(board) => json(board)
		)
	)();
};
