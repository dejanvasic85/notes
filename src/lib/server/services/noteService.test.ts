import { describe, expect, it, vi, type MockedFunction } from 'vitest';
import { okAsync, errAsync } from 'neverthrow';

import { getNoteOwnerUserId, getNoteEditor } from '$lib/server/db/notesDb';
import { createError } from '$lib/server/errorFactory';
import type { Note } from '$lib/types';

import { isNoteEditorOrOwner, canDeleteNote, resolveNotePatch } from './noteService';

vi.mock('$lib/server/db/notesDb');

const baseNote: Note = {
	id: 'nid_1',
	text: 'existing text',
	textPlain: 'existing text',
	title: 'existing title',
	colour: 'blue',
	boardId: 'bid_1',
	contentUpdatedAt: null,
	colourUpdatedAt: null
};

const mockGetNoteOwnerId = getNoteOwnerUserId as MockedFunction<typeof getNoteOwnerUserId>;
const mockGetEditor = getNoteEditor as MockedFunction<typeof getNoteEditor>;

describe('isNoteEditorOrOwner', () => {
	it('should return true when the user is an owner', async () => {
		mockGetNoteOwnerId.mockReturnValue(okAsync('1'));

		const result = await isNoteEditorOrOwner({ noteId: '1', userId: '1' });

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBe(true);
	});

	it('should return true when the user is not an owner but is editor', async () => {
		mockGetNoteOwnerId.mockReturnValue(okAsync('2'));
		mockGetEditor.mockReturnValue(
			okAsync({
				noteId: 'nid_1',
				userId: 'uid_222',
				selected: true,
				id: '1',
				createdAt: new Date(),
				updatedAt: new Date()
			})
		);

		const result = await isNoteEditorOrOwner({ noteId: 'nid_1', userId: 'uid_222' });

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBe(true);
	});

	it('should return false when the user is not an owner nor an editor', async () => {
		mockGetNoteOwnerId.mockReturnValue(okAsync('2'));
		mockGetEditor.mockReturnValue(errAsync(createError('RecordNotFound', 'NoteEditor not found')));

		const result = await isNoteEditorOrOwner({ noteId: 'nid_1', userId: 'uid_222' });

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr()).toEqual(
			expect.objectContaining({
				_tag: 'RecordNotFound'
			})
		);
	});

	it('should return false when the user is not an owner and editor is not selected', async () => {
		mockGetNoteOwnerId.mockReturnValue(okAsync('2'));
		mockGetEditor.mockReturnValue(
			okAsync({
				noteId: 'nid_1',
				userId: 'uid_222',
				selected: false,
				id: '1',
				createdAt: new Date(),
				updatedAt: new Date()
			})
		);

		const result = await isNoteEditorOrOwner({ noteId: 'nid_1', userId: 'uid_222' });

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBe(false);
	});
});

describe('canDeleteNote', () => {
	it('should return true when the user is an owner', async () => {
		mockGetNoteOwnerId.mockReturnValue(okAsync('1'));

		const result = await canDeleteNote({ noteId: '1', userId: '1' });

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBe(true);
	});

	it('should return Unauthorized error when user is not owner', async () => {
		mockGetNoteOwnerId.mockReturnValue(okAsync('uid_111'));
		const result = await canDeleteNote({ noteId: 'nid_111', userId: 'uid_222' });

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr()).toEqual({
			_tag: 'AuthorizationError',
			message: 'Only note owner can delete note'
		});
	});
});

describe('resolveNotePatch', () => {
	it('applies a content patch newer than the note', () => {
		const existing = { ...baseNote, contentUpdatedAt: new Date('2026-08-01T00:00:00Z') };
		const patch = {
			text: 'new text',
			textPlain: 'new text',
			title: 'new title',
			contentUpdatedAt: new Date('2026-08-02T00:00:00Z')
		};

		expect(resolveNotePatch(existing, patch)).toEqual(patch);
	});

	it('drops a content patch older than the note, keeping the rest of the patch', () => {
		const existing = { ...baseNote, contentUpdatedAt: new Date('2026-08-02T00:00:00Z') };
		const patch = {
			text: 'stale text',
			textPlain: 'stale text',
			title: 'stale title',
			contentUpdatedAt: new Date('2026-08-01T00:00:00Z'),
			colour: 'red',
			colourUpdatedAt: new Date('2026-08-03T00:00:00Z')
		};

		expect(resolveNotePatch(existing, patch)).toEqual({
			colour: 'red',
			colourUpdatedAt: patch.colourUpdatedAt
		});
	});

	it('applies a content patch when the note has never had a content edit before', () => {
		const patch = {
			text: 'first edit',
			textPlain: 'first edit',
			title: 'first edit',
			contentUpdatedAt: new Date('2026-08-01T00:00:00Z')
		};

		expect(resolveNotePatch(baseNote, patch)).toEqual(patch);
	});

	it('resolves the colour group independently of the content group', () => {
		const existing = {
			...baseNote,
			contentUpdatedAt: new Date('2026-08-01T00:00:00Z'),
			colourUpdatedAt: new Date('2026-08-01T00:00:00Z')
		};
		const patch = {
			colour: 'green',
			colourUpdatedAt: new Date('2026-08-02T00:00:00Z')
		};

		expect(resolveNotePatch(existing, patch)).toEqual(patch);
	});

	it('drops a colour patch older than the note', () => {
		const existing = { ...baseNote, colourUpdatedAt: new Date('2026-08-02T00:00:00Z') };
		const patch = {
			colour: 'stale colour',
			colourUpdatedAt: new Date('2026-08-01T00:00:00Z')
		};

		expect(resolveNotePatch(existing, patch)).toEqual({});
	});

	it('drops a content change sent without its timestamp, even against a note that has never been edited', () => {
		const patch = { text: 'sneaky', textPlain: 'sneaky', title: 'sneaky' };

		expect(resolveNotePatch(baseNote, patch)).toEqual({});
	});

	it('drops a colour change sent without its timestamp', () => {
		const patch = { colour: 'sneaky colour' };

		expect(resolveNotePatch(baseNote, patch)).toEqual({});
	});
});
