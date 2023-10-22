import { json, type RequestHandler } from '@sveltejs/kit';

import { updateBoard } from '$lib/services/boardService';
import { getNoteById, updateNote, deleteNote } from '$lib/services/noteService';
import { getUserById, isBoardOwner } from '$lib/services/userService';

export const GET: RequestHandler = async ({ locals, params }) => {
	const id = params.id;
	if (!id) {
		return json(null, { status: 400 });
	}

	const note = await getNoteById(id);
	if (!note) {
		return json(null, { status: 404 });
	}

	const userId = locals.user.id!;
	const user = await getUserById(userId, { boards: true, notes: false });
	if (!user) {
		return json(null, { status: 404 });
	}

	if (!isBoardOwner(user, note.boardId!)) {
		return json(null, { status: 403 });
	}

	return json(note);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const noteId = params.id!;
	const userId = locals.user.id!;

	const note = await getNoteById(noteId);
	if (!note) {
		return json(null, { status: 404 });
	}

	// todo: validate body
	const changes = await request.json();
	const user = await getUserById(userId, { boards: true, notes: false });
	if (!user) {
		return json(null, { status: 404 });
	}

	if (!isBoardOwner(user, note.boardId!)) {
		return json(null, { status: 403 });
	}

	const updatedNote = await updateNote({ ...note, ...changes });

	return json(updatedNote);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const noteId = params.id!;
	const userId = locals.user.id!;

	const note = await getNoteById(noteId);
	if (!note) {
		return json(null, { status: 404 });
	}

	const user = await getUserById(userId, { boards: true, notes: false });
	if (!user) {
		return json(null, { status: 404 });
	}

	if (!isBoardOwner(user, note.boardId!)) {
		return json(null, { status: 403 });
	}

	await deleteNote(noteId);

	// delete the note from the order
	const board = user.boards.find((b) => b.id === note.boardId);
	if (!board) {
		return json(null, { status: 404 });
	}

	const updatedOrder = board.noteOrder.filter((id) => id !== noteId);
	await updateBoard({
		...board,
		noteOrder: updatedOrder
	});

	return new Response(null, { status: 204 });
};
