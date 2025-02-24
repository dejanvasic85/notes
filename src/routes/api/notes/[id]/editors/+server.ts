import { type RequestHandler, json, error } from '@sveltejs/kit';

import { pipe } from 'fp-ts/lib/function.js';
import { taskEither as TE } from 'fp-ts';

import { parseRequest } from '$lib/server/requestParser';
import { NoteEditorInputSchema } from '$lib/types';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { updateNoteEditor } from '$lib/server/services/noteService';

export const POST: RequestHandler = async ({ request, params }) => {
	return pipe(
		parseRequest(request, NoteEditorInputSchema, 'Unable to parse NoteEditorInputSchema'),
		TE.map((input) => ({
			noteId: params.id!,
			...input
		})),
		TE.flatMap((data) => updateNoteEditor(data)),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => error(err.status, { message: err.message }),
			(data) => json(data)
		)
	)();
};
