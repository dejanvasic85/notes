import { json, type RequestHandler } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts/lib';

import { updateBoard } from '$lib/server/db/boardDb';
import { getUser } from '$lib/server/db/userDb';

import { isNoteOwner } from '$lib/server/services/userService';
import { NoteCreateInputSchema } from '$lib/types';
import { validateRequest } from '$lib/server/validateRequest';
import { mapToApiError } from '$lib/server/mapApi';
import { createError } from '$lib/server/createError';

export const POST: RequestHandler = async ({ locals, request }) => {
	return pipe(
		TE.Do,
		TE.bind('noteInput', () => validateRequest(request, NoteCreateInputSchema)),
		TE.bind('user', () => getUser({ id: locals.user.id!, includeBoards: true })),
		TE.chain(({ noteInput, user }) => isNoteOwner({ user, note: noteInput })),
		TE.chain(({ note, user }) => {
			const boardId = note.boardId;
			const currentBoard = user.boards.find((b) => b.id === boardId);
			if (!currentBoard) {
				return TE.left(createError('RecordNotFound', `Board ${boardId} not found`));
			}
			return pipe(
				updateBoard({ ...currentBoard, noteOrder: [...currentBoard.noteOrder, note.id!] }),
				TE.map(() => ({ note, user }))
			);
		}),
		TE.mapLeft(mapToApiError),
		TE.match(
			(error) => json(error, { status: error.status }),
			({ note }) => json(note, { status: 201 })
		)
	)();
};
