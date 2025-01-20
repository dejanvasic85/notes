import { describe, it, expect, vi, type MockedFunction } from 'vitest';
import { taskEither as TE } from 'fp-ts';

import { getNoteById, updateNote, deleteNote } from '$lib/server/db/notesDb';
import { getUser } from '$lib/server/db/userDb';
import { updateBoard } from '$lib/server/db/boardDb';
import { isNoteOwner, getCurrentBoardForUserNote } from '$lib/server/services/userService';
import type { AuthorizationError, NotePatchInput } from '$lib/types';

import { GET, PATCH, DELETE } from './+server';

vi.mock('$lib/server/db/notesDb');
vi.mock('$lib/server/db/userDb');
vi.mock('$lib/server/db/boardDb');
vi.mock('$lib/server/services/userService');

const mockGetUser = getUser as MockedFunction<typeof getUser>;
const mockGetNoteById = getNoteById as MockedFunction<typeof getNoteById>;
const mockDeleteNote = deleteNote as MockedFunction<typeof deleteNote>;
const mockUpdateNote = updateNote as MockedFunction<typeof updateNote>;
const mockIsNoteOwner = isNoteOwner as MockedFunction<typeof isNoteOwner>;
const mockUpdateBoard = updateBoard as MockedFunction<typeof updateBoard>;
const mockGetCurrentBoardForUserNote = getCurrentBoardForUserNote as MockedFunction<
	typeof getCurrentBoardForUserNote
>;

const mockNote = {
	id: 'nid_123',
	text: 'Hello world!',
	boardId: 'bid_123'
};

const mockUser = {
	id: 'uid_123',
	username: 'testuser',
	boards: [{ id: 'bid_123', name: 'Test board', ownerId: 'uid_123', noteOrder: [] }]
};

describe('GET', () => {
	it('should return a note successfully', async () => {
		mockGetUser.mockReturnValue(TE.right(mockUser) as any);
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteOwner.mockReturnValue(TE.right(mockNote) as any);

		const locals = { user: { id: 'uid_123' } };
		const result = await GET({
			locals,
			params: { id: 'nid_123' }
		} as any);

		expect(result.status).toBe(200);
		const data = await result.json();
		expect(data).toStrictEqual(mockNote);
	});

	it('should return a 404 when user is not found', async () => {
		mockGetUser.mockReturnValue(TE.left({ _tag: 'RecordNotFound', message: 'User not found' }));
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteOwner.mockReturnValue(TE.right(mockNote) as any);

		const locals = { user: { id: 'uid_123' } };
		expect(
			GET({
				locals,
				params: { id: 'nid_123' }
			} as any)
		).rejects.toEqual({
			status: 404,
			body: { message: 'User not found' }
		});
	});

	it('should return a 404 when note is not found', async () => {
		mockGetUser.mockReturnValue(TE.right(mockUser) as any);
		mockGetNoteById.mockReturnValue(TE.left({ _tag: 'RecordNotFound', message: 'Note not found' }));
		mockIsNoteOwner.mockReturnValue(TE.right(mockNote) as any);

		const locals = { user: { id: 'uid_123' } };
		expect(
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
		const apiError: AuthorizationError = { message: 'Unauthorized', _tag: 'AuthorizationError' };
		mockIsNoteOwner.mockReturnValue(TE.left(apiError));
		mockGetUser.mockReturnValue(TE.right(mockUser) as any);
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);

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
	it('should return a note successfully', async () => {
		const noteInput: NotePatchInput = {
			colour: 'black',
			text: 'Hello world!',
			textPlain: 'hello again'
		};
		const locals = { user: { id: 'uid_123' } };

		mockIsNoteOwner.mockReturnValue(TE.right({ user: mockUser, note: mockNote, noteInput }) as any);
		mockUpdateNote.mockReturnValue(TE.right(mockNote) as any);
		mockGetUser.mockReturnValue(TE.right(mockUser) as any);
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);

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
	it.skip('should return 204 and call the repository to delete the note successfully', async () => {
		const locals = { user: { id: 'uid_123' } };
		const mockBoard = { ...mockUser.boards[0], noteOrder: [mockNote.id] };
		mockGetUser.mockReturnValue(
			TE.right({
				...mockUser,
				boards: [mockBoard]
			}) as any
		);
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteOwner.mockReturnValue(TE.right({ user: mockUser, note: mockNote }) as any);
		mockDeleteNote.mockReturnValue(TE.right(mockNote) as any);
		mockGetCurrentBoardForUserNote.mockReturnValue(
			TE.right({ user: mockUser, note: mockNote, board: mockBoard } as any)
		);
		mockUpdateBoard.mockReturnValue(TE.right({} as any));

		const result = await DELETE({
			locals,
			params: { id: mockNote.id }
		} as any);

		expect(mockIsNoteOwner).toHaveBeenCalledWith({ user: mockUser, note: mockNote });
		expect(mockUpdateBoard).toHaveBeenCalled();
		expect(result.status).toBe(204);
	});
});
