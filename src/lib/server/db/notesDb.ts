import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/server/db';
import type { ServerError, Note, IdParams, NoteEditorInput, NoteEditor } from '$lib/types';
import { fromNullableRecord, tryDbTask } from './utils';

export const getNoteById = ({ id }: IdParams): TE.TaskEither<ServerError, Note> =>
	pipe(
		tryDbTask(() => db.note.findFirst({ where: { id } })),
		TE.flatMap(fromNullableRecord(`Note with id ${id} not found`))
	);

export const getNoteOwnerUserId = (noteId: string): TE.TaskEither<ServerError, string> => {
	return pipe(
		tryDbTask(() => {
			return db.note.findFirstOrThrow({
				where: { id: noteId },
				select: { board: { select: { userId: true } } }
			});
		}),
		TE.flatMap((d) => TE.right(d.board.userId))
	);
};

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

export const createNoteEditor = (noteEditor: NoteEditor): TE.TaskEither<ServerError, NoteEditor> =>
	tryDbTask(() => db.noteEditor.create({ data: noteEditor }));

export const createOrUpdateNoteEditor = (
	data: NoteEditorInput
): TE.TaskEither<ServerError, NoteEditor> => {
	return tryDbTask(() => {
		return db.noteEditor.upsert({
			where: { id: data.id },
			update: data,
			create: data
		});
	});
};

export const getNoteEditor = ({ noteId, userId }: Pick<NoteEditor, 'noteId' | 'userId'>) =>
	tryDbTask(() => {
		return db.noteEditor.findFirst({
			where: {
				userId: userId,
				noteId: noteId
			}
		});
	});

type GetSharedNotesParmas = {
	userId: string;
};

export const getSharedNotes = ({
	userId
}: GetSharedNotesParmas): TE.TaskEither<ServerError, Note[]> =>
	pipe(
		tryDbTask(() => {
			return db.note.findMany({
				where: {
					editors: { some: { userId } }
				},
				include: {
					board: {
						include: { user: { select: { name: true, id: true } } }
					}
				}
			});
		})
	);
