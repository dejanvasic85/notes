import { ResultAsync, okAsync, errAsync } from 'neverthrow';

import { PUBLIC_BASE_URL } from '$env/static/public';

import {
	createOrUpdateNoteEditor,
	createNoteEditor,
	getNoteById,
	getNoteEditor,
	getNoteOwnerUserId
} from '$lib/server/db/notesDb';
import { getUserByNoteId, getUser } from '$lib/server/db/userDb';
import type { Note, NoteEditor, NoteEditorInput, NotePatchInput, ServerError } from '$lib/types';
import { generateId } from '$lib/identityGenerator';
import { createError } from '$lib/server/errorFactory';
import { sendEmail } from './emailService';

export const updateNoteEditor = (input: NoteEditorInput): ResultAsync<void, ServerError> =>
	createOrUpdateNoteEditor(input)
		.andThen((data) =>
			getUser({ id: input.userId, includeBoards: false }).map((friend) => ({ data, friend }))
		)
		.andThen(({ data, friend }) =>
			getUserByNoteId(input.noteId).map((fromUser) => ({ data, friend, fromUser }))
		)
		.andThen(({ data, friend, fromUser }) => {
			if (!data.selected || !friend.email) {
				return okAsync<void, ServerError>(undefined);
			}
			const html = `Hello, ${fromUser.name} has given you access to
				<a href="${PUBLIC_BASE_URL}/my/board?id=${input.noteId}" target="_blank">
				collaborate on their note!</a>.`;

			return sendEmail({
				html,
				subject: 'You have been given access to edit a note!',
				to: friend.email
			});
		});

type NoteEditorInviteInput = {
	noteId: string;
	userId: string;
};

export const addNoteEditorFromInvite = (
	input: NoteEditorInviteInput
): ResultAsync<NoteEditor | null, ServerError> =>
	getNoteById({ id: input.noteId })
		.andThen((note) => getNoteEditor({ noteId: note.id, userId: input.userId }))
		.andThen((noteEditor) =>
			noteEditor
				? okAsync<NoteEditor | null, ServerError>(noteEditor)
				: createNoteEditor({
						id: generateId('ned'),
						noteId: input.noteId,
						userId: input.userId,
						selected: true
					})
		);

type NoteAuthParams = {
	noteId: string;
	userId: string;
};

export const isNoteEditor = (params: NoteAuthParams): ResultAsync<boolean, ServerError> =>
	getNoteEditor(params).map((editor) => !!editor && editor.selected);

export const isNoteOwner = (params: NoteAuthParams): ResultAsync<boolean, ServerError> =>
	getNoteOwnerUserId(params.noteId).map((ownerId) => ownerId === params.userId);

export const isNoteEditorOrOwner = (params: NoteAuthParams): ResultAsync<boolean, ServerError> =>
	isNoteOwner(params).andThen((isOwner) =>
		isOwner ? okAsync<boolean, ServerError>(true) : isNoteEditor(params)
	);

const contentFields = ['text', 'textPlain', 'title'] as const;

// True when a group's change should be dropped: either it lost to a
// concurrent edit stamped later, or it has no timestamp at all. The latter
// matters as much as the former - without it, a patch that touches a group
// without its timestamp would bypass conflict resolution entirely and always
// win, since there'd be nothing to compare against `existing`.
function isStaleOrUntimed(
	patchTimestamp: Date | undefined,
	existingTimestamp: Date | null | undefined
): boolean {
	if (!patchTimestamp) {
		return true;
	}
	return !!existingTimestamp && existingTimestamp > patchTimestamp;
}

// The offline write queue (#855) sends field-scoped patches, each stamped with
// the client's edit time for its group. A patch older than the note's current
// group timestamp lost to a concurrent edit elsewhere - drop just that group,
// not the whole patch, since the two groups are edited independently.
export function resolveNotePatch(existing: Note, patch: NotePatchInput): Partial<Note> {
	const resolved: Partial<Note> = { ...patch };

	const touchesContent =
		patch.text !== undefined || patch.textPlain !== undefined || patch.title !== undefined;
	if (touchesContent && isStaleOrUntimed(patch.contentUpdatedAt, existing.contentUpdatedAt)) {
		for (const field of contentFields) {
			delete resolved[field];
		}
		delete resolved.contentUpdatedAt;
	}

	if (
		patch.colour !== undefined &&
		isStaleOrUntimed(patch.colourUpdatedAt, existing.colourUpdatedAt)
	) {
		delete resolved.colour;
		delete resolved.colourUpdatedAt;
	}

	return resolved;
}

export const canDeleteNote = (params: NoteAuthParams): ResultAsync<boolean, ServerError> =>
	isNoteOwner(params).andThen((canDelete) =>
		canDelete
			? okAsync<boolean, ServerError>(canDelete)
			: errAsync(createError('AuthorizationError', 'Only note owner can delete note'))
	);
