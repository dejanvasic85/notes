import { json, error, type RequestHandler } from '@sveltejs/kit';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { getBoard, updateBoard } from '$lib/server/db/boardDb';
import { getNoteById, updateNote, deleteNote } from '$lib/server/db/notesDb';
import { isNoteEditorOrOwner } from '$lib/server/services/noteService';
import { parseRequest } from '$lib/server/requestParser';
import { NotePatchInputSchema } from '$lib/types';

export const GET: RequestHandler = ({ locals, params }) => {
	return pipe(
		TE.Do,
		TE.bind('note', () => getNoteById({ id: params.id! })),
		TE.bind('canEdit', () => isNoteEditorOrOwner({ noteId: params.id!, userId: locals.user!.id })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			({ note }) => json(note)
		)
	)();
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	return pipe(
		TE.Do,
		TE.bind('noteInput', () =>
			parseRequest(request, NotePatchInputSchema, 'Unable to parse NotePatchInputSchema')
		),
		TE.bind('note', () => getNoteById({ id: params.id! })),
		TE.bind('canEdit', () => isNoteEditorOrOwner({ noteId: params.id!, userId: locals.user!.id })),
		TE.flatMap(({ noteInput, note }) => updateNote({ ...note, ...noteInput })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(note) => json(note)
		)
	)();
};

// todo: remove the note from anyone else's note order
export const DELETE: RequestHandler = async ({ locals, params }) => {
	return pipe(
		TE.Do,
		TE.bind('note', () => getNoteById({ id: params.id! })),
		TE.bind('canEdit', () => isNoteEditorOrOwner({ noteId: params.id!, userId: locals.user!.id })),
		TE.bind('board', (p) => getBoard({ id: p.note.boardId! })),
		TE.flatMap(({ board, note }) => {
			return pipe(
				updateBoard({ ...board, noteOrder: board.noteOrder.filter((id) => id !== note.id) }),
				TE.map(() => ({ board, note }))
			);
		}),
		TE.flatMap(({ note }) => pipe(deleteNote({ id: note.id! }))),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			() => new Response(null, { status: 204 })
		)
	)();
};
