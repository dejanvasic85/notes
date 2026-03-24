import { json, error, type RequestHandler } from '@sveltejs/kit';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { getBoard, updateBoard } from '$lib/server/db/boardDb';
import { getNoteById, updateNote, deleteNote } from '$lib/server/db/notesDb';
import { isNoteEditorOrOwner, canDeleteNote } from '$lib/server/services/noteService';
import { parseRequest } from '$lib/server/requestParser';
import { NotePatchInputSchema } from '$lib/types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const result = await getNoteById({ id: params.id! })
		.andThen((note) =>
			isNoteEditorOrOwner({ noteId: params.id!, userId: locals.user!.id }).map(() => note)
		)
		.mapErr(mapToApiError);

	return result.match(
		(note) => json(note),
		(err) => error(err.status, { message: err.message })
	);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const result = await parseRequest(
		request,
		NotePatchInputSchema,
		'Unable to parse NotePatchInputSchema'
	)
		.andThen((noteInput) => getNoteById({ id: params.id! }).map((note) => ({ noteInput, note })))
		.andThen(({ noteInput, note }) =>
			isNoteEditorOrOwner({ noteId: params.id!, userId: locals.user!.id }).map(() => ({
				noteInput,
				note
			}))
		)
		.andThen(({ noteInput, note }) => updateNote({ ...note, ...noteInput }))
		.mapErr(mapToApiError);

	return result.match(
		(note) => json(note),
		(err) => error(err.status, { message: err.message })
	);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const result = await getNoteById({ id: params.id! })
		.andThen((note) =>
			canDeleteNote({ noteId: params.id!, userId: locals.user!.id }).map(() => note)
		)
		.andThen((note) => getBoard({ id: note.boardId! }).map((board) => ({ note, board })))
		.andThen(({ note, board }) =>
			updateBoard({ ...board, noteOrder: board.noteOrder.filter((id) => id !== note.id) }).map(
				() => note
			)
		)
		.andThen((note) => deleteNote({ id: note.id! }))
		.mapErr(mapToApiError);

	return result.match(
		() => new Response(null, { status: 204 }),
		(err) => error(err.status, { message: err.message })
	);
};
