import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/server/db';
import { withError } from '$lib/server/createError';
import type { ServerError, Note, IdParams } from '$lib/types';
import { fromNullableRecord, tryDbTask } from './utils';

export const getNoteById = ({ id }: IdParams): TE.TaskEither<ServerError, Note> =>
	pipe(
		tryDbTask(() => db.note.findUnique({ where: { id } })),
		TE.flatMap(fromNullableRecord(`Note with id ${id} not found`))
	);

export const updateNote = (note: Note): TE.TaskEither<ServerError, Note> =>
	tryDbTask(() =>
		db.note.update({
			where: { id: note.id },
			data: {
				...note,
				boardId: note.boardId!,
				updatedAt: new Date()
			}
		})
	);

export const deleteNote = ({ id }: { id: string }): TE.TaskEither<ServerError, Note> =>
	TE.tryCatch(
		() => {
			return db.note.delete({
				where: { id }
			});
		},
		withError('DatabaseError', 'Failed to delete note')
	);

export const createNote = (note: Note): TE.TaskEither<ServerError, Note> =>
	TE.tryCatch(
		() => {
			return db.note.create({
				data: {
					...note,
					boardId: note.boardId!
				}
			});
		},
		withError('DatabaseError', 'Failed to create note')
	);
