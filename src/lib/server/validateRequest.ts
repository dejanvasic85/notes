import { taskEither as TE } from 'fp-ts';

import type { ServerError } from '$lib/types';

import { createFromError } from './createError';

interface Parser<T> {
	parse: (json: any) => T;
}

// todo: rename this to parseRequest
export const validateRequest = <T>(
	request: Request,
	parser: Parser<T>
): TE.TaskEither<ServerError, T> =>
	TE.tryCatch(
		async () => {
			const json = await request.json();
			return parser.parse(json);
		},
		createFromError('ValidationError', 'Invalid note input')
	);
