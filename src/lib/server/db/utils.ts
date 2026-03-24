import { type Result, ResultAsync, ok, err } from 'neverthrow';

import type { ServerError } from '$lib/types';
import { createError, withError } from '$lib/server/errorFactory';

export const tryDbTask = <T>(
	func: () => Promise<T>,
	customError = 'Unexpected database error occurred'
): ResultAsync<T, ServerError> => {
	return ResultAsync.fromPromise(func(), withError('DatabaseError', customError));
};

export const fromNullableRecord =
	<T>(message: string) =>
	(value: T | null): Result<T, ServerError> =>
		value != null ? ok(value) : err(createError('RecordNotFound', message));
