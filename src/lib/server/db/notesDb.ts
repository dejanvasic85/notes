import { ResultAsync, okAsync } from 'neverthrow';

import db from '$lib/server/db';
import type {
	ServerError,
	Note,
	IdParams,
	NoteEditorInput,
	NoteEditor,
	CreateNoteInput,
	NoteOwner
} from '$lib/types';
import { fromNullableRecord, tryDbTask } from './utils';

export const getNoteById = ({ id }: IdParams): ResultAsync<Note, ServerError> =>
	tryDbTask(() => db.note.findFirst({ where: { id } })).andThen(
		fromNullableRecord(`Note with id ${id} not found`)
	);

export const getNoteOwnerUserId = (noteId: string): ResultAsync<string, ServerError> =>
	tryDbTask(() =>
		db.note.findFirstOrThrow({
			where: { id: noteId },
			select: { board: { select: { userId: true } } }
		})
	).map((d) => d.board.userId);

export const updateNote = (note: Note): ResultAsync<Note, ServerError> =>
	tryDbTask(() =>
		db.note.update({
			where: { id: note.id },
			data: {
				...note,
				boardId: note.boardId!,
				updatedAt: new Date(),
				editors: undefined
			}
		})
	);

export const deleteNote = ({ id }: { id: string }): ResultAsync<Note, ServerError> =>
	tryDbTask(() => db.note.delete({ where: { id } }));

type CreateNoteParams = CreateNoteInput & {
	boardId: string;
};

export const createNote = (noteParams: CreateNoteParams): ResultAsync<Note, ServerError> =>
	tryDbTask(() =>
		db.note.create({
			data: {
				...noteParams,
				editors: undefined
			}
		})
	);

export const createNoteEditor = (noteEditor: NoteEditor): ResultAsync<NoteEditor, ServerError> =>
	tryDbTask(() => db.noteEditor.create({ data: noteEditor }));

export const createOrUpdateNoteEditor = (
	data: NoteEditorInput
): ResultAsync<NoteEditor, ServerError> =>
	tryDbTask(() =>
		db.noteEditor.upsert({
			where: { id: data.id },
			update: data,
			create: data
		})
	);

export const getNoteEditor = ({ noteId, userId }: Pick<NoteEditor, 'noteId' | 'userId'>) =>
	tryDbTask(() =>
		db.noteEditor.findFirst({
			where: {
				userId: userId,
				noteId: noteId
			}
		})
	);

type GetSharedNotesParams = {
	userId: string;
};

export const getSharedNotes = ({
	userId
}: GetSharedNotesParams): ResultAsync<Note[], ServerError> =>
	tryDbTask(() =>
		db.note.findMany({
			where: {
				editors: { some: { userId } }
			},
			include: { editors: true }
		})
	);

export const getNoteOwners = (noteIds: string[]): ResultAsync<NoteOwner[], ServerError> =>
	tryDbTask(() =>
		db.note.findMany({
			where: { id: { in: noteIds } },
			select: { id: true, board: { select: { user: true } } }
		})
	).map((r) =>
		r.map(
			({ id: noteId, board: { user } }) =>
				({
					noteId,
					owner: {
						id: user.id,
						name: user.name,
						email: user.email,
						picture: user.picture
					}
				}) satisfies NoteOwner
		)
	);

type DeselectAllNoteEditors = {
	userId: string;
	noteEditorUserId: string;
};

export const deselectAllNoteEditors = ({ userId, noteEditorUserId }: DeselectAllNoteEditors) =>
	tryDbTask(() =>
		db.noteEditor.updateMany({
			data: {
				selected: false,
				updatedAt: new Date()
			},
			where: {
				note: {
					board: {
						userId
					}
				},
				userId: noteEditorUserId
			}
		})
	);
