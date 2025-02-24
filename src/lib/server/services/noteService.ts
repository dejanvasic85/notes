import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import { PUBLIC_BASE_URL } from '$env/static/public';

import {
	createOrUpdateNoteEditor,
	createNoteEditor,
	getNoteById,
	getNoteEditor,
	getNoteOwnerUserId
} from '$lib/server/db/notesDb';
import { getUserByNoteId, getUser } from '$lib/server/db/userDb';
import type { NoteEditor, NoteEditorInput, ServerError } from '$lib/types';
import { generateId } from '$lib/identityGenerator';
import { createError } from '$lib/server/errorFactory';
import { sendEmail } from './emailService';

export const updateNoteEditor = (input: NoteEditorInput): TE.TaskEither<ServerError, void> => {
	return pipe(
		TE.Do,
		TE.bind('data', () => createOrUpdateNoteEditor(input)),
		TE.bind('friend', () => getUser({ id: input.userId, includeBoards: false })),
		TE.bind('fromUser', () => getUserByNoteId(input.noteId)),
		TE.flatMap(({ data, friend, fromUser }) => {
			if (!data.selected || !friend.email) {
				return TE.right(undefined);
			}
			const html = `Hello, ${fromUser.name} has given you access to 
				<a href="${PUBLIC_BASE_URL}/my/board?id=${input.noteId}" target="_blank">
				collaborate on their note!</a>.`;

			return sendEmail({
				html,
				subject: 'You have been given access to edit a note!',
				to: friend.email
			});
		})
	);
};

type NoteEditorInviteInput = {
	noteId: string;
	userId: string;
};

export const addNoteEditorFromInvite = (
	input: NoteEditorInviteInput
): TE.TaskEither<ServerError, NoteEditor | null> =>
	pipe(
		getNoteById({ id: input.noteId }),
		TE.flatMap((note) =>
			note ? getNoteEditor({ noteId: note.id, userId: input.userId }) : TE.right(null)
		),
		TE.flatMap((noteEditor) =>
			noteEditor
				? TE.right(noteEditor)
				: createNoteEditor({
						id: generateId('ned'),
						noteId: input.noteId,
						userId: input.userId,
						selected: true
					})
		)
	);

type NoteAuthParams = {
	noteId: string;
	userId: string;
};

export const isNoteEditor = (params: NoteAuthParams): TE.TaskEither<ServerError, boolean> => {
	return pipe(
		getNoteEditor(params),
		TE.map((editor) => !!editor && editor.selected)
	);
};

export const isNoteOwner = (params: NoteAuthParams): TE.TaskEither<ServerError, boolean> => {
	return pipe(
		getNoteOwnerUserId(params.noteId),
		TE.map((ownerId) => ownerId === params.userId)
	);
};

export const isNoteEditorOrOwner = (
	params: NoteAuthParams
): TE.TaskEither<ServerError, boolean> => {
	return pipe(
		isNoteOwner(params),
		TE.flatMap((isOwner) => (isOwner ? TE.right(true) : isNoteEditor(params))),
		TE.flatMap(
			(isEditor) =>
				TE.right(isEditor) ||
				TE.left(createError('AuthorizationError', 'User is not an editor or owner'))
		)
	);
};

export const canDeleteNote = (params: NoteAuthParams): TE.TaskEither<ServerError, boolean> =>
	pipe(
		isNoteOwner(params),
		TE.flatMap((canDelete) =>
			canDelete
				? TE.right(canDelete)
				: TE.left(createError('AuthorizationError', 'Only note owner can delete note'))
		)
	);
