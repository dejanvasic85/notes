import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { getBoardById, updateBoard } from '$lib/server/services/boardService';
import { getUserById, isBoardOwner } from '$lib/server/services/userService';
import { BoardPatchSchema } from '$lib/types';

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const boardId = params.id!;
	const userId = locals.user.id!;

	const changes = await request.json();
	const parseResult = BoardPatchSchema.safeParse(changes);
	if (!parseResult.success) {
		return json({ message: 'Unable to parse BoardPatchSchema' }, { status: 400 });
	}

	const user = await getUserById(userId, { boards: true, notes: false });
	if (!user) {
		return json({ message: 'Unknown user' }, { status: 404 });
	}

	if (!isBoardOwner(user, boardId)) {
		return json({ message: 'Do not have access' }, { status: 403 });
	}

	const board = await getBoardById(boardId);
	if (!board) {
		return json({ message: 'Unknown board' }, { status: 404 });
	}

	const updatedBoard = await updateBoard({ ...board, ...parseResult.data });

	return json(updatedBoard);
};
