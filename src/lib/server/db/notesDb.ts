import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/server/db';
import { withError } from '$lib/server/createError';
import type { ServerError, Note, IdParams, NoteEditorInput } from '$lib/types';
import { fromNullableRecord, tryDbTask } from './utils';

export const getNoteById = ({ id }: IdParams): TE.TaskEither<ServerError, Note> =>
	pipe(
		tryDbTask(() => db.note.findUnique({ where: { id } })),
		TE.flatMap(fromNullableRecord(`Note with id ${id} not found`))
	);

export const updateNote = (note: Note): TE.TaskEither<ServerError, Note> =>
	tryDbTask(() => {
		return db.note.update({
			where: { id: note.id },
			data: {
				...note,
				boardId: note.boardId!,
				updatedAt: new Date(),
				editors: undefined
			}
		});
	});

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
					boardId: note.boardId!,
					editors: undefined
				}
			});
		},
		withError('DatabaseError', 'Failed to create note')
	);

export const createOrUpdateNote = (data: NoteEditorInput) => {
	return TE.tryCatch(
		() => {
			return db.noteEditor.upsert({
				where: { id: data.id },
				update: data,
				create: data
			});
		},
		withError('DatabaseError', 'Failed to create note editor')
	);
};
