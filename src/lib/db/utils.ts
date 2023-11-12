import * as TE from 'fp-ts/TaskEither';
import type { DatabaseError, ServerError, RecordNotFoundError } from '$lib/types';

export const tryDbTask = <T>(func: () => Promise<T>): TE.TaskEither<ServerError, T> => {
	return TE.tryCatch(func, toDatabasError);
};

export const toDatabasError = (err: unknown) => {
	if (err instanceof Error) {
		const databaseError: DatabaseError = {
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: err
		};
		return databaseError;
	}

	const unknownError: DatabaseError = {
		_tag: 'DatabaseError',
		message: 'Unknown error',
		originalError: String(err)
	};
	return unknownError;
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
