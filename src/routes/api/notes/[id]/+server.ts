import { json, type RequestHandler } from '@sveltejs/kit';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { mapToApiError } from '$lib/server/mapApi';
import { getNoteById, updateNote } from '$lib/server/db/notesDb';
import { getUser } from '$lib/server/db/userDb';
import { updateBoard } from '$lib/server/services/boardService';
import { getNoteById as getNote, deleteNote } from '$lib/server/services/noteService';
import { getUserById, isBoardOwner, isNoteOwner } from '$lib/server/services/userService';
import { validateRequest } from '$lib/server/validateRequest';
import { NotePatchInputSchema } from '$lib/types';

export const GET: RequestHandler = async ({ locals, params }) => {
	return await pipe(
		TE.Do,
		TE.bind('user', () => getUser({ id: locals.user.id! })),
		TE.bind('note', () => getNoteById({ id: params.id! })),
		TE.chain(({ user, note }) => isNoteOwner({ user, note })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(note) => json(note)
		)
	)();
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	return pipe(
		TE.Do,
		TE.bind('noteInput', () => validateRequest(request, NotePatchInputSchema)),
		TE.bind('note', () => getNoteById({ id: params.id! })),
		TE.bind('user', () => getUser({ id: locals.user.id! })),
		TE.chain((params) => isNoteOwner(params)),
		TE.chain(({ noteInput, note }) => updateNote({ ...note, ...noteInput })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(note) => json(note)
		)
	)();
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
