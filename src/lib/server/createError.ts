import type { ErrorType } from '$lib/types';

export const createFromError = (_tag: ErrorType, message: string) => (err: unknown) => {
	return createError(_tag, message, err);
};

export const createError = (_tag: ErrorType, message: string, originalError?: unknown) => ({
	_tag,
	message,
	originalError: originalError instanceof Error ? originalError : String(originalError)
});
