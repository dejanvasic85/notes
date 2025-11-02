interface FetchOptions {
	shouldParse?: boolean;
	clearQueueOnError?: boolean; // New option
}

interface Success<T> {
	type: 'ok';
	value: T;
}

interface Fail {
	type: 'error';
	value: Error;
}

export type Result<T> = Success<T> | Fail;

export function success<T>(value: T): Success<T> {
	return {
		type: 'ok',
		value
	};
}

export function fail(message: string): Fail {
	return {
		type: 'error',
		value: new Error(message)
	};
}

const maxRetries = 3;
const retryDelay = 200;
let queueTail: Promise<unknown> = Promise.resolve();

async function fetchWithRetry(func: () => Promise<Response>, retryCount = 0): Promise<Response> {
	try {
		const response = await func();
		// Retry server errors (500+)
		if (!response.ok && response.status >= 500) {
			if (retryCount < maxRetries) {
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				return fetchWithRetry(func, retryCount + 1);
			}
		}

		return response;
	} catch (err: unknown) {
		if (retryCount < maxRetries) {
			await new Promise((resolve) => setTimeout(resolve, retryDelay));
			return fetchWithRetry(func, retryCount + 1);
		}
		throw err;
	}
}

export async function tryFetch<T>(
	input: URL | RequestInfo,
	init?: RequestInit,
	options?: FetchOptions
): Promise<Result<T>> {
	const shouldParse = options?.shouldParse ?? false;
	const clearQueueOnError = options?.clearQueueOnError ?? false;

	const thisRequest = queueTail.then(() =>
		fetchWithRetry(() =>
			fetch(input, {
				...init,
				headers: {
					'Content-Type': 'application/json',
					...init?.headers
				}
			})
		).then(async (resp) => {
			if (!resp.ok) {
				const rawText = await resp.text();
				return fail(rawText);
			}

			if (shouldParse) {
				return resp.json().then((json) => success(json));
			} else {
				return success(resp);
			}
		})
	);

	if (clearQueueOnError) {
		queueTail = thisRequest.catch(() => {
			queueTail = Promise.resolve();
			return undefined;
		});
	} else {
		queueTail = thisRequest.catch(() => undefined);
	}

	return thisRequest;
}
