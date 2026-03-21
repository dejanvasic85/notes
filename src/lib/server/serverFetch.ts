import { ResultAsync } from 'neverthrow';

import type { ServerError } from '$lib/types';
import { withError } from '$lib/server/errorFactory';

export const tryFetchJson = <T>(
	params: RequestInfo | URL,
	init?: RequestInit
): ResultAsync<T, ServerError> =>
	ResultAsync.fromPromise(
		(async () => {
			try {
				const result = await fetch(params, init);
				if (result.ok) {
					return result.json() as Promise<T>;
				}
				throw new Error(await result.text());
			} catch (error) {
				console.error(`Failed to fetch. ${JSON.stringify(error)}`);
				throw new Error(`Failed to fetch`, { cause: error });
			}
		})(),
		withError('FetchError', `Failed in server call. Try again.`)
	);
