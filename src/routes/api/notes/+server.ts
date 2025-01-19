import { json, error, type RequestHandler } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts/lib';

import { updateBoard } from '$lib/server/db/boardDb';
import { getUser } from '$lib/server/db/userDb';
import { createNote } from '$lib/server/db/notesDb';
import { isNoteOwner, getCurrentBoardForUserNote } from '$lib/server/services/userService';
import { parseRequest } from '$lib/server/parseRequest';
import { mapToApiError } from '$lib/server/mapApi';
import { NoteSchema } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	return pipe(
		TE.Do,
		TE.bind('note', () => parseRequest(request, NoteSchema, 'Unable to parse Note')),
		TE.bind('user', () => getUser({ id: locals.user!.id, includeBoards: true })),
		TE.flatMap(({ note, user }) => isNoteOwner({ user, note })),
		TE.flatMap(({ note, user }) => getCurrentBoardForUserNote({ user, note })),
		TE.flatMap(({ board, note, user }) =>
			pipe(
				updateBoard({ ...board, noteOrder: [...board.noteOrder, note.id!] }),
				TE.map(() => ({ note, user }))
			)
		),
		TE.flatMap(({ note }) => createNote({ ...note, boardId: note.boardId! })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(note) => json(note, { status: 201 })
		)
	)();
};
