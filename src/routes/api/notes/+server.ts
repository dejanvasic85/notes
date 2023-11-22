import { json, type RequestHandler } from '@sveltejs/kit';

import { createNote } from '$lib/server/services/noteService';
import { updateBoard } from '$lib/server/services/boardService';
import { getUserById, isBoardOwner } from '$lib/server/services/userService';
import { NoteCreateInputSchema } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const changes = await request.json();
	const parseResult = NoteCreateInputSchema.safeParse(changes);
	if (!parseResult.success) {
		return json({ message: 'Unable to parse NoteCreateInputSchema' }, { status: 400 });
	}

	const { id, boardId, text, textPlain, colour } = parseResult.data;
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
	const note = await createNote({ id, boardId, text, textPlain, colour });

	return json(note, { status: 201 });
};
