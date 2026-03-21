import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';

import { isBoardOwner } from '$lib/server/services/userService';
import { getBoard, updateBoard } from '$lib/server/db/boardDb';
import { parseRequest } from '$lib/server/requestParser';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { BoardPatchSchema } from '$lib/types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const result = await getBoard({ id: params.id! })
		.andThen((board) => isBoardOwner({ userId: locals.user!.id, board }))
		.mapErr(mapToApiError);

	return result.match(
		(data) => json(data),
		(err) => error(err.status, { message: err.message })
	);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const result = await parseRequest(request, BoardPatchSchema, 'Unable to parse BoardPatchSchema')
		.andThen((changes) => getBoard({ id: params.id! }).map((board) => ({ changes, board })))
		.andThen(({ changes, board }) =>
			isBoardOwner({ board, userId: locals.user?.id }).map(() => ({ changes, board }))
		)
		.andThen(({ changes, board }) => updateBoard({ ...board, ...changes }))
		.mapErr(mapToApiError);

	return result.match(
		(board) => json(board),
		(err) => error(err.status, { message: err.message })
	);
};
