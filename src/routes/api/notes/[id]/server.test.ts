import { describe, it, expect, vi, type MockedFunction } from 'vitest';
import { taskEither as TE } from 'fp-ts';

import { getNoteById, updateNote, deleteNote } from '$lib/server/db/notesDb';
import { updateBoard, getBoard } from '$lib/server/db/boardDb';
import { isNoteEditorOrOwner } from '$lib/server/services/noteService';
import type { NotePatchInput } from '$lib/types';

import { GET, PATCH, DELETE } from './+server';

vi.mock('$lib/server/db/notesDb');
vi.mock('$lib/server/db/boardDb');
vi.mock('$lib/server/services/noteService');

const mockGetNoteById = getNoteById as MockedFunction<typeof getNoteById>;
const mockDeleteNote = deleteNote as MockedFunction<typeof deleteNote>;
const mockUpdateNote = updateNote as MockedFunction<typeof updateNote>;
const mockUpdateBoard = updateBoard as MockedFunction<typeof updateBoard>;
const mockIsNoteEditorOrOwner = isNoteEditorOrOwner as MockedFunction<typeof isNoteEditorOrOwner>;
const mockGetBoard = getBoard as MockedFunction<typeof getBoard>;

const mockNote = {
	id: 'nid_123',
	text: 'Hello world!',
	boardId: 'bid_123'
};

describe('GET', () => {
	it('should return a note successfully', async () => {
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteEditorOrOwner.mockReturnValue(TE.right(true) as any);

		const locals = { user: { id: 'uid_123' } };
		const result = await GET({
			locals,
			params: { id: 'nid_123' }
		} as any);

		expect(result.status).toBe(200);
		const data = await result.json();
		expect(data).toStrictEqual(mockNote);
	});

	it('should return a 404 when note is not found', async () => {
		mockGetNoteById.mockReturnValue(TE.left({ _tag: 'RecordNotFound', message: 'Note not found' }));

		const locals = { user: { id: 'uid_123' } };
		await expect(
			GET({
				locals,
				params: { id: 'nid_123' }
			} as any)
		).rejects.toEqual({
			status: 404,
			body: { message: 'Note not found' }
		});
	});

	it('should return a 403 when note does belong to the user', async () => {
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteEditorOrOwner.mockReturnValue(
			TE.left({ _tag: 'AuthorizationError', message: 'Unauthorized' })
		);

		const locals = { user: { id: 'uid_123' } };
		await expect(
			GET({
				locals,
				params: { id: 'nid_123' }
			} as any)
		).rejects.toEqual({
			status: 403,
			body: { message: 'Unauthorized' }
		});
	});
});

describe('PATCH', () => {
	it('should update a note successfully', async () => {
		const noteInput: NotePatchInput = {
			colour: 'black',
			text: 'Hello world!',
			textPlain: 'hello again'
		};
		const locals = { user: { id: 'uid_123' } };

		mockUpdateNote.mockReturnValue(TE.right(mockNote) as any);
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteEditorOrOwner.mockReturnValue(TE.right(true) as any);

		const request = {
			json: vi.fn().mockResolvedValue(noteInput)
		};

		const result = await PATCH({
			locals,
			request,
			params: { id: mockNote.id }
		} as any);

		expect(result.status).toBe(200);
		const data = await result.json();
		expect(data).toEqual(mockNote);
		expect(mockUpdateNote).toHaveBeenCalledWith({
			colour: 'black',
			text: 'Hello world!',
			textPlain: 'hello again',
			id: 'nid_123',
			boardId: 'bid_123'
		});
	});
});

describe('DELETE', () => {
	it('should return 204 and call the repository to delete the note successfully', async () => {
		const locals = { user: { id: 'uid_123' } };
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockDeleteNote.mockReturnValue(TE.right(mockNote) as any);
		mockUpdateBoard.mockReturnValue(TE.right({} as any));
		mockIsNoteEditorOrOwner.mockReturnValue(TE.right(true) as any);
		mockGetBoard.mockReturnValue(TE.right({ id: 'bid_123', noteOrder: ['nid_123'] }) as any);

		const result = await DELETE({
			locals,
			params: { id: mockNote.id }
		} as any);

		expect(mockUpdateBoard).toHaveBeenCalled();
		expect(result.status).toBe(204);
	});
});
