import type { ValidationError } from '$lib/types';

export const createValidationError = (err: unknown, message: string): ValidationError => {
	return {
		_tag: 'ValidationError',
		message,
		originalError: err
	};
};
