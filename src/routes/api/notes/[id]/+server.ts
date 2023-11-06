import { json, type RequestHandler } from '@sveltejs/kit';

import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { updateBoard } from '$lib/services/boardService';
import { getNoteById, updateNote, deleteNote } from '$lib/services/noteService';
import { NotePatchInputSchema } from '$lib/types';
import { getUserById, isBoardOwner } from '$lib/services/userService';
import type { Note, User } from '$lib/types';

interface ApiError {
	status: number;
	message: string;
}

interface IdParams {
	id: string;
}

const getNoteTask = ({ id }: IdParams): TE.TaskEither<ApiError, Note> => {
	return TE.tryCatch(
		() => getNoteById(id),
		() => ({ status: 404, message: 'Note not found' })
	);
};

const getUserTask = ({ id }: IdParams): TE.TaskEither<ApiError, User> => {
	return TE.tryCatch(
		() => getUserById(id),
		() => ({ status: 404, message: 'User not found' })
	);
};

export const GET: RequestHandler = async ({ locals, params }) => {
	const result = await pipe(
		TE.Do,
		TE.bind('user', () => getUserTask({ id: locals.user.id! })),
		TE.bind('note', () => getNoteTask({ id: params.id! })),
		TE.chain(({ user, note }) =>
			isBoardOwner(user, note.boardId!)
				? TE.right(note)
				: TE.left({ status: 403, message: 'Unauthorized' } as ApiError)
		)
	)();

	console.log('result', result);

	return json(null, { status: 500 });
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const noteId = params.id!;
	const userId = locals.user.id!;

	const note = await getNoteById(noteId);
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
