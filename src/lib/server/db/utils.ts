import { taskEither as TE } from 'fp-ts';
import type { ServerError, RecordNotFoundError } from '$lib/types';
import { createFromError } from '$lib/server/createError';

export const tryDbTask = <T>(func: () => Promise<T>): TE.TaskEither<ServerError, T> => {
	return TE.tryCatch(func, createFromError('DatabaseError', 'Database error'));
};

export const fromNullableRecord =
	<T>(message: string) =>
	(value: T | null): TE.TaskEither<ServerError, T> => {
		if (!value) {
			const recordNotFoundError: RecordNotFoundError = {
				_tag: 'RecordNotFound',
				message
			};
			return TE.left(recordNotFoundError);
		}

		return TE.right(value);
	};
