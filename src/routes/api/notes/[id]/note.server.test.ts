import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { taskEither as TE } from 'fp-ts';

import { getNoteById, updateNote } from '$lib/server/db/notesDb';
import { getUser } from '$lib/server/db/userDb';
import { isNoteOwner } from '$lib/server/services/userService';
import type { AuthorizationError, NotePatchInput } from '$lib/types';

import { GET, PATCH } from './+server';

vi.mock('$lib/server/db/notesDb');
vi.mock('$lib/server/db/userDb');
vi.mock('$lib/server/services/userService');

const mockGetUser = getUser as MockedFunction<typeof getUser>;
const mockGetNoteById = getNoteById as MockedFunction<typeof getNoteById>;
const mockUpdateNote = updateNote as MockedFunction<typeof updateNote>;
const mockIsNoteOwner = isNoteOwner as MockedFunction<typeof isNoteOwner>;

const mockNote = {
	id: 'nid_123',
	text: 'Hello world!',
	boardId: 'bid_123'
};

const mockUser = {
	id: 'uid_123',
	username: 'testuser',
	boards: [{ id: 'bid_123', name: 'Test board', ownerId: 'uid_123' }]
};

describe('GET', () => {
	beforeEach(() => {
		// todo: move these out of here because they being overwritten in other tests
		mockGetUser.mockReturnValue(TE.right(mockUser) as any);
		mockGetNoteById.mockReturnValue(TE.right(mockNote) as any);
		mockIsNoteOwner.mockReturnValue(TE.right(mockNote) as any);
	});

	it('should return a note successfully', async () => {
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

		const locals = { user: { id: 'uid_123' } };
		const result = await GET({
			locals,
			params: { id: 'nid_123' }
		} as any);

		expect(result.status).toBe(404);
		const data = await result.json();
		expect(data).toStrictEqual({ message: 'User not found' });
	});

	it('should return a 404 when note is not found', async () => {
		mockGetNoteById.mockReturnValue(TE.left({ _tag: 'RecordNotFound', message: 'Note not found' }));

		const locals = { user: { id: 'uid_123' } };
		const result = await GET({
			locals,
			params: { id: 'nid_123' }
		} as any);

		expect(result.status).toBe(404);
		const data = await result.json();
		expect(data).toStrictEqual({ message: 'Note not found' });
	});

	it('should return a 403 when note does belong to the user', async () => {
		const apiError: AuthorizationError = { message: 'Unauthorized', _tag: 'AuthorizationError' };
		mockIsNoteOwner.mockReturnValue(TE.left(apiError));

		const locals = { user: { id: 'uid_123' } };
		const result = await GET({
			locals,
			params: { id: 'nid_123' }
		} as any);

		expect(result.status).toBe(403);
		const data = await result.json();
		expect(data).toStrictEqual({ message: 'Unauthorized' });
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
