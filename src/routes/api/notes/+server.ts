import { json, error, type RequestHandler } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts/lib';

import { updateBoard, getBoardByUserId } from '$lib/server/db/boardDb';
import { getUser } from '$lib/server/db/userDb';
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
		TE.bind('user', () =>
			getUser({ id: locals.user!.id, includeBoards: false, includeNotes: false })
		),
		TE.bind('board', ({ user }) => getBoardByUserId({ userId: user.id, includeNotes: false })),
		// Update board note order
		TE.flatMap(({ board, createNoteInput, user }) =>
			pipe(
				updateBoard({ ...board, noteOrder: [...board.noteOrder, createNoteInput.id] }),
				TE.map(() => ({ createNoteInput, user, board }))
			)
		),
		// Create Note
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
