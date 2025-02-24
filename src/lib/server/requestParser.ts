import { taskEither as TE } from 'fp-ts';

import type { ServerError } from '$lib/types';
import { withError } from '$lib/server/errorFactory';

interface Parser<T> {
	parse: (json: any) => T;
}

export const parseRequest = <T>(
	request: Request,
	parser: Parser<T>,
	errorMessage: string
): TE.TaskEither<ServerError, T> =>
	TE.tryCatch(
		async () => {
			const json = await request.json();
			return parser.parse(json);
		},
		withError('ValidationError', errorMessage)
	);
