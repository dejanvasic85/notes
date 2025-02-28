import { describe, expect, it, vi, type MockedFunction } from 'vitest';
import { taskEither as TE } from 'fp-ts';

import { getNoteOwnerUserId, getNoteEditor } from '$lib/server/db/notesDb';
import { createError } from '$lib/server/errorFactory';

import { isNoteEditorOrOwner, canDeleteNote } from './noteService';

vi.mock('$lib/server/db/notesDb');

const mockGetNoteOwnerId = getNoteOwnerUserId as MockedFunction<typeof getNoteOwnerUserId>;
const mockGetEditor = getNoteEditor as MockedFunction<typeof getNoteEditor>;

describe('isNoteEditorOrOwner', () => {
	it('should return true when the user is an owner', async () => {
		mockGetNoteOwnerId.mockReturnValue(TE.right('1'));

		const result: any = await isNoteEditorOrOwner({ noteId: '1', userId: '1' })();

		expect(result).toEqual({ _tag: 'Right', right: true });
	});

	it('should return true when the user is not an owner but is editor', async () => {
		mockGetNoteOwnerId.mockReturnValue(TE.right('2'));
		mockGetEditor.mockReturnValue(
			TE.right({
				noteId: 'nid_1',
				userId: 'uid_222',
				selected: true,
				id: '1',
				createdAt: new Date(),
				updatedAt: new Date()
			})
		);

		const result: any = await isNoteEditorOrOwner({ noteId: 'nid_1', userId: 'uid_222' })();

		expect(result).toEqual({ _tag: 'Right', right: true });
	});

	it('should return false when the user is not an owner nor an editor', async () => {
		mockGetNoteOwnerId.mockReturnValue(TE.right('2'));
		mockGetEditor.mockReturnValue(TE.left(createError('RecordNotFound', 'NoteEditor not found')));

		const result: any = await isNoteEditorOrOwner({ noteId: 'nid_1', userId: 'uid_222' })();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual(
			expect.objectContaining({
				_tag: 'RecordNotFound'
			})
		);
	});

	it('should return false when the user is not an owner and editor is not selected', async () => {
		mockGetNoteOwnerId.mockReturnValue(TE.right('2'));
		mockGetEditor.mockReturnValue(
			TE.right({
				noteId: 'nid_1',
				userId: 'uid_222',
				selected: false,
				id: '1',
				createdAt: new Date(),
				updatedAt: new Date()
			})
		);

		const result: any = await isNoteEditorOrOwner({ noteId: 'nid_1', userId: 'uid_222' })();

		expect(result).toEqual({ _tag: 'Right', right: false });
	});
});

describe('canDeleteNote', () => {
	it('should return true when the user is an owner', async () => {
		mockGetNoteOwnerId.mockReturnValue(TE.right('1'));

		const result: any = await canDeleteNote({ noteId: '1', userId: '1' })();

		expect(result).toEqual({ _tag: 'Right', right: true });
	});

	it('should return Unauthorized error when user is not owner', async () => {
		mockGetNoteOwnerId.mockReturnValue(TE.right('uid_111'));
		const result: any = await canDeleteNote({ noteId: 'nid_111', userId: 'uid_222' })();

		expect(result.left).toEqual({
			_tag: 'AuthorizationError',
			message: 'Only note owner can delete note'
		});
	});
});
