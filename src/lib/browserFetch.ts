import type { ToastMessages } from './state/toastMessages.svelte';
import type { ToastMessage } from './types';

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
	status?: number;
}

export type Result<T> = Success<T> | Fail;

export function success<T>(value: T): Success<T> {
	return {
		type: 'ok',
		value
	};
}

export function fail(message: string, status?: number): Fail {
	return {
		type: 'error',
		value: new Error(message),
		status
	};
}

// Thrown when fetch() itself never got a response - offline, DNS failure,
// captive portal - as opposed to the server responding with an error status.
// tryFetch normalizes this into a Result instead of letting it escape as an
// unhandled rejection, so callers can distinguish "try again later" from a
// genuine server error and enqueue the mutation instead of losing it.
export class NetworkUnavailableError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'NetworkUnavailableError';
	}
}

const maxRetries = 3;
const retryDelay = 200;
const defaultIdleTimeout = 8000;
let queueTail: Promise<unknown> = Promise.resolve();
let pending = 0;

export function isWriteQueueIdle(): boolean {
	return pending === 0;
}

// Resolves when the write queue drains, or after `timeoutMs` so a hung request
// (fetch has no built-in timeout) can never block the caller indefinitely.
export async function whenWriteQueueIdle(timeoutMs = defaultIdleTimeout): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (pending > 0) {
		const remaining = deadline - Date.now();
		if (remaining <= 0) {
			return;
		}
		let timer: ReturnType<typeof setTimeout> | undefined;
		const timeout = new Promise<void>((resolve) => {
			timer = setTimeout(resolve, remaining);
		});
		await Promise.race([queueTail.catch(() => undefined), timeout]);
		clearTimeout(timer);
	}
}

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
		throw new NetworkUnavailableError('Network unavailable after retries', { cause: err });
	}
}

export async function tryFetch<T>(
	input: URL | RequestInfo,
	init?: RequestInit,
	options?: FetchOptions
): Promise<Result<T>> {
	const shouldParse = options?.shouldParse ?? false;
	const clearQueueOnError = options?.clearQueueOnError ?? false;

	pending++;
	const thisRequest: Promise<Result<T>> = queueTail
		.then(() =>
			fetchWithRetry(() =>
				fetch(input, {
					...init,
					headers: {
						'Content-Type': 'application/json',
						...init?.headers
					}
				})
			).then(async (resp): Promise<Result<T>> => {
				if (!resp.ok) {
					const rawText = await resp.text().catch(() => resp.statusText);
					return fail(rawText, resp.status);
				}

				if (shouldParse) {
					// A malformed body (empty 200, a proxy's HTML error page) must
					// resolve to a Fail like any other bad response, not reject -
					// the same escaped-rejection class this module exists to fix.
					try {
						return success((await resp.json()) as T);
					} catch {
						return fail('Malformed response body', resp.status);
					}
				} else {
					return success(resp as T);
				}
			})
		)
		.catch((err: unknown): Result<T> => {
			if (err instanceof NetworkUnavailableError) {
				return { type: 'error', value: err };
			}
			throw err;
		})
		.finally(() => {
			pending--;
		});

	// A genuinely unexpected rejection (not the normalized NetworkUnavailableError
	// case above) must still not permanently wedge the next queued call. Guarded
	// by identity: if another tryFetch call has already chained its own tail on
	// in the meantime, this reset must not clobber it.
	const tail = thisRequest
		.then((result) => {
			if (
				clearQueueOnError &&
				result.type === 'error' &&
				result.value instanceof NetworkUnavailableError &&
				queueTail === tail
			) {
				queueTail = Promise.resolve();
			}
		})
		.catch(() => undefined);
	queueTail = tail;

	return thisRequest;
}

interface OptimisticUpdateParams<TApplied, TResult extends Result<unknown>> {
	apply: () => TApplied;
	request: (applied: TApplied) => Promise<TResult>;
	revert: (applied: TApplied) => void;
	errorMessage: string;
	successMessage?: string;
	toastMessages: ToastMessages;
	// Called instead of revert/toast when the request failed because the
	// network was unreachable, not because the server rejected it - the
	// optimistic change stays applied and the caller is expected to durably
	// queue the mutation for replay once back online.
	onNetworkUnavailable?: (applied: TApplied) => void;
}

// Runs an optimistic local mutation, then reverts it and shows a toast if the
// matching request fails, or shows a success toast if one was requested.
// Returns the request result so callers can layer extra success-only
// behaviour (e.g. navigation) on top.
export async function runOptimisticUpdate<TApplied, TResult extends Result<unknown>>({
	apply,
	request,
	revert,
	errorMessage,
	successMessage,
	toastMessages,
	onNetworkUnavailable
}: OptimisticUpdateParams<TApplied, TResult>): Promise<TResult> {
	const applied = apply();
	const result = await request(applied);

	if (result.type === 'error') {
		if (onNetworkUnavailable && result.value instanceof NetworkUnavailableError) {
			onNetworkUnavailable(applied);
			return result;
		}

		revert(applied);
		const errorMessageValue: ToastMessage = { type: 'error', message: errorMessage };
		toastMessages.addMessage(errorMessageValue);
	} else if (successMessage) {
		const successMessageValue: ToastMessage = { type: 'success', message: successMessage };
		toastMessages.addMessage(successMessageValue);
	}

	return result;
}
