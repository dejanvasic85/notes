import { json, error, type RequestHandler } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts/lib';

import { updateBoard, getBoardByUserId } from '$lib/server/db/boardDb';
import { createNote } from '$lib/server/db/notesDb';
import { parseRequest } from '$lib/server/parseRequest';
import { mapToApiError } from '$lib/server/mapApi';
import { CreateNoteInputSchema } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	return pipe(
		TE.Do,
		TE.bind('createNoteInput', () =>
			parseRequest(request, CreateNoteInputSchema, 'Unable to parse Note')
		),
		TE.bind('board', () => getBoardByUserId({ userId: locals.user!.id, includeNotes: false })),
		TE.flatMap(({ board, createNoteInput }) =>
			pipe(
				updateBoard({ ...board, noteOrder: [...board.noteOrder, createNoteInput.id] }),
				TE.map(() => ({ createNoteInput, board }))
			)
		),
		TE.flatMap(({ createNoteInput, board }) =>
			createNote({ note: createNoteInput, boardId: board.id })
		),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(note) => json(note, { status: 201 })
		)
	)();
};
