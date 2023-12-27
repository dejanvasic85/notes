import { json, type RequestHandler } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts/lib';

import { updateBoard } from '$lib/server/db/boardDb';
import { getUser } from '$lib/server/db/userDb';
import { createNote } from '$lib/server/db/notesDb';
import { isNoteOwner } from '$lib/server/services/userService';
import { parseRequest } from '$lib/server/parseRequest';
import { mapToApiError } from '$lib/server/mapApi';
import { createError } from '$lib/server/createError';
import { NoteCreateInputSchema } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	return pipe(
		TE.Do,
		TE.bind('noteInput', () =>
			parseRequest(request, NoteCreateInputSchema, 'Unable to parse NoteCreateInputSchema')
		),
		TE.bind('user', () => getUser({ id: locals.user.id!, includeBoards: true })),
		TE.flatMap(({ noteInput, user }) => isNoteOwner({ user, note: noteInput })),
		TE.flatMap(({ note, user }) => {
			const boardId = note.boardId;
			const currentBoard = user.boards.find((b) => b.id === boardId);
			if (!currentBoard) {
				return TE.left(createError('RecordNotFound', `Board ${boardId} not found`));
			}
			return TE.right({ note, user, currentBoard });
		}),
		TE.flatMap(({ currentBoard, note, user }) =>
			pipe(
				updateBoard({ ...currentBoard, noteOrder: [...currentBoard.noteOrder, note.id!] }),
				TE.map(() => ({ note, user }))
			)
		),
		TE.flatMap(({ note }) => createNote({ ...note, boardId: note.boardId! })),
		TE.mapLeft(mapToApiError),
		TE.match(
			(error) => json(error, { status: error.status }),
			(note) => json(note, { status: 201 })
		)
	)();
};
