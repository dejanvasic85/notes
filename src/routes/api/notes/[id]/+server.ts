import { json, type RequestHandler } from '@sveltejs/kit';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { mapToApiError } from '$lib/server/mapApi';
import { getNoteById } from '$lib/db/notesDb';
import { updateBoard } from '$lib/server/services/boardService';
import { getNoteById as getNote, updateNote, deleteNote } from '$lib/server/services/noteService';
import { getUserById, isBoardOwner, isBoardOwnerApiTask } from '$lib/server/services/userService';
import { NotePatchInputSchema } from '$lib/types';
import { getUser } from '$lib/db/userDb';

export const GET: RequestHandler = async ({ locals, params }) => {
	return await pipe(
		TE.Do,
		TE.bind('user', () => getUser({ id: locals.user.id! })),
		TE.bind('note', () => getNoteById({ id: params.id! })),
		TE.mapLeft(mapToApiError),
		TE.chainEitherK(isBoardOwnerApiTask),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(note) => json(note)
		)
	)();
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const noteId = params.id!;
	const userId = locals.user.id!;

	const note = await getNote(noteId);
	if (!note) {
		return json(null, { status: 404 });
	}

	const changes = await request.json();
	const parseResult = NotePatchInputSchema.safeParse(changes);
	if (!parseResult.success) {
		parseResult.error.errors.forEach((e) => console.error(e));
		return json({ message: 'Unable to parse NoteSchema' }, { status: 400 });
	}

	const user = await getUserById(userId, { boards: true, notes: false });
	if (!user) {
		return json(null, { status: 404 });
	}

	if (!isBoardOwner(user, note.boardId!)) {
		return json(null, { status: 403 });
	}

	const updatedNote = await updateNote({
		...note,
		...parseResult.data
	});

	return json(updatedNote);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const noteId = params.id!;
	const userId = locals.user.id!;

	const note = await getNote(noteId);
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

	const board = user.boards.find((b) => b.id === note.boardId);
	if (!board) {
		return json(null, { status: 404 });
	}

	await deleteNote(noteId);

	const updatedOrder = board.noteOrder.filter((id) => id !== noteId);
	await updateBoard({
		...board,
		noteOrder: updatedOrder
	});

	return new Response(null, { status: 204 });
};
