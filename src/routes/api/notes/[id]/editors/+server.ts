import { type RequestHandler, json, error } from '@sveltejs/kit';

import { parseRequest } from '$lib/server/requestParser';
import { NoteEditorInputSchema } from '$lib/types';
import { mapToApiError } from '$lib/server/apiResultMapper';
import { updateNoteEditor } from '$lib/server/services/noteService';

export const POST: RequestHandler = async ({ request, params }) => {
	const result = await parseRequest(
		request,
		NoteEditorInputSchema,
		'Unable to parse NoteEditorInputSchema'
	)
		.map((input) => ({ noteId: params.id!, ...input }))
		.andThen((data) => updateNoteEditor(data))
		.mapErr(mapToApiError);

	return result.match(
		(data) => json(data),
		(err) => error(err.status, { message: err.message })
	);
};
