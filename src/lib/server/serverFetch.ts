import type { ServerError } from '$lib/types';
import { taskEither as TE } from 'fp-ts';
import { withError } from './createError';

export const tryFetchJson = <T>(
	params: RequestInfo | URL,
	init?: RequestInit
): TE.TaskEither<ServerError, T> => {
	return TE.tryCatch(
		async () => {
			try {
				const result = await fetch(params, init);
				if (result.ok) {
					return result.json();
				}
				throw new Error(await result.text());
			} catch (error) {
				throw new Error(`Failed to fetch. Error: ${error}`);
			}
		},
		withError('FetchError', 'Failed to fetch')
	);
};
