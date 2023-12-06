import { taskEither as TE } from 'fp-ts';
import type { ServerError } from '$lib/types';
import { createError, withError } from '$lib/server/createError';

export const tryDbTask = <T>(func: () => Promise<T>): TE.TaskEither<ServerError, T> => {
	return TE.tryCatch(func, withError('DatabaseError', 'Database error'));
};

export const fromNullableRecord =
	<T>(message: string) =>
	(value: T | null): TE.TaskEither<ServerError, T> =>
		value ? TE.right(value) : TE.left(createError('RecordNotFound', message));
