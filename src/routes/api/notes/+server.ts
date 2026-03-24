import { json, error, type RequestHandler } from '@sveltejs/kit';

import { updateBoard, getBoardByUserId } from '$lib/server/db/boardDb';
import { createNote } from '$lib/server/db/notesDb';
import { parseRequest } from '$lib/server/requestParser';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { CreateNoteInputSchema } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const result = await parseRequest(request, CreateNoteInputSchema, 'Unable to parse Note')
		.andThen((createNoteInput) =>
			getBoardByUserId({ userId: locals.user!.id, includeNotes: false }).map((board) => ({
				createNoteInput,
				board
			}))
		)
		.andThen(({ createNoteInput, board }) =>
			updateBoard({ ...board, noteOrder: [...board.noteOrder, createNoteInput.id] }).map(() => ({
				createNoteInput,
				board
			}))
		)
		.andThen(({ createNoteInput, board }) => createNote({ ...createNoteInput, boardId: board.id }))
		.mapErr(mapToApiError);

	return result.match(
		(note) => json(note, { status: 201 }),
		(err) => error(err.status, { message: err.message })
	);
};
