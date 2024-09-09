import { type RequestHandler, json } from '@sveltejs/kit';

import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { parseRequest } from '$lib/server/parseRequest';
import { NoteEditorInputSchema } from '$lib/types';
import { mapToApiError } from '$lib/server/mapApi';
import { createOrUpdateNote } from '$lib/server/db/notesDb';

export const POST: RequestHandler = async ({ request, params }) => {
	return pipe(
		parseRequest(request, NoteEditorInputSchema, 'Unable to parse NotePatchInputSchema'),
		TE.map((input) => ({
			noteId: params.id!,
			...input
		})),
		TE.flatMap((data) => createOrUpdateNote(data)),
		TE.mapLeft(mapToApiError),
		TE.match(
			(err) => json({ message: err.message }, { status: err.status }),
			(data) => json(data)
		)
	)();
};
