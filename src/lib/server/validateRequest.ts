import { taskEither as TE } from 'fp-ts';

import type { ServerError } from '$lib/types';

import { createValidationError } from './createError';

interface Parser<T> {
	parse: (json: any) => T;
}

export const validateRequest = <T>(
	request: Request,
	parser: Parser<T>
): TE.TaskEither<ServerError, T> =>
	TE.tryCatch(
		async () => {
			const json = await request.json();
			return parser.parse(json);
		},
		(err) => createValidationError(err, 'Invalid note input')
	);
