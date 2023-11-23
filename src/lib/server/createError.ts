import type { ErrorType, ServerError } from '$lib/types';

export const createError = (_tag: ErrorType, message: string): ((e: unknown) => ServerError) => {
	return function (err: unknown) {
		const originalError = err instanceof Error ? err : String(err);
		return {
			_tag,
			message,
			originalError
		};
	};
};
