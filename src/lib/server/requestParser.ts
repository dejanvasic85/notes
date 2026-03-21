import { ResultAsync } from 'neverthrow';

import type { ServerError } from '$lib/types';
import { withError } from '$lib/server/errorFactory';

interface Parser<T> {
	parse: (json: unknown) => T;
}

export const parseRequest = <T>(
	request: Request,
	parser: Parser<T>,
	errorMessage: string
): ResultAsync<T, ServerError> =>
	ResultAsync.fromPromise(
		(async () => {
			const json = await request.json();
			return parser.parse(json);
		})(),
		withError('ValidationError', errorMessage)
	);
