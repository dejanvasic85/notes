import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import type { NoteCreateInput, ServerError, ValidationError } from '$lib/types';

const createValidationError = (err: unknown, message: string): ValidationError => {
	return {
		_tag: 'ValidationError',
		message,
		originalError: err
	};
};

export const validateNoteInput = async (
	request: Request
): TE.TaskEither<ServerError, NoteCreateInput> =>
	pipe(
		TE.tryCatch(
			() => request.json(),
			(err) => createValidationError(err, 'Unable to parse NoteCreateInputSchema')
		)
	);
