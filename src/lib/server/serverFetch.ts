import { taskEither as TE } from 'fp-ts';

import type { ServerError } from '$lib/types';
import { withError } from '$lib/server/errorFactory';

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
				console.error(`Failed to fetch. ${JSON.stringify(error)}`);
				throw new Error(`Failed to fetch`);
			}
		},
		withError('FetchError', `Failed in server call. Try again.`)
	);
};
