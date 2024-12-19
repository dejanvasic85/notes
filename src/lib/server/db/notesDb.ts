import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/server/db';
import { withError } from '$lib/server/createError';
import type {
	ServerError,
	Note,
	IdParams,
	NoteEditorInput,
	NoteEditor,
	SharedNote
} from '$lib/types';

import { fromNullableRecord, tryDbTask } from './utils';

export const getNoteById = ({ id }: IdParams): TE.TaskEither<ServerError, Note> =>
	pipe(
		tryDbTask(() => db.note.findFirst({ where: { id } })),
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
	tryDbTask(() =>
		db.note.delete({
			where: { id }
		})
	);

export const createNote = (note: Note): TE.TaskEither<ServerError, Note> =>
	tryDbTask(() =>
		db.note.create({
			data: {
				...note,
				boardId: note.boardId!,
				editors: undefined
			}
		})
	);

export const createOrUpdateNoteEditor = (
	data: NoteEditorInput
): TE.TaskEither<ServerError, NoteEditor> => {
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

export const getSharedNotes = ({
	userId
}: {
	userId: string;
}): TE.TaskEither<ServerError, SharedNote[]> =>
	pipe(
		tryDbTask(() => {
			return db.note.findMany({
				where: {
					editors: { some: { userId } }
				},
				include: { board: { include: { user: { select: { name: true, id: true } } } } }
			});
		}),
		TE.map((data) =>
			data.map(({ id, colour, text, textPlain, board }) => ({
				id,
				colour,
				text,
				textPlain,
				friendUserId: board.user.id,
				friendName: board.user.name
			}))
		)
	);
