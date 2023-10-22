import { json, type RequestHandler } from '@sveltejs/kit';

import { getUserById, isBoardOwner } from '$lib/services/userService';
import { createNote } from '$lib/services/noteService';
import { updateBoard } from '$lib/services/boardService';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { id, boardId, text, colour = null } = await request.json();
	const userId = locals.user.id!;
	const user = await getUserById(userId, { boards: true, notes: false });
	if (!user) {
		return json(null, { status: 404 });
	}

	if (!isBoardOwner(user, boardId)) {
		return json(null, { status: 403 });
	}

	const currentBoard = user.boards.find((b) => b.id === boardId);
	if (!currentBoard) {
		return json(null, { status: 404 });
	}

	await updateBoard({ ...currentBoard, noteOrder: [...currentBoard.noteOrder, id] });
	const note = await createNote({ id, boardId, text, colour });

	return json(note, { status: 201 });
};
