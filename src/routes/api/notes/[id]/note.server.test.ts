import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { either as E, taskEither as TE } from 'fp-ts';

import { getNoteById } from '$lib/db/notesDb';
import { getUser } from '$lib/db/userDb';
import { isBoardOwnerApiTask } from '$lib/server/services/userService';
import { GET } from './+server';
import type { ApiError } from '$lib/types';

vi.mock('$lib/db/notesDb');
vi.mock('$lib/db/userDb');
vi.mock('$lib/server/services/userService');

const mockGetUser = getUser as MockedFunction<typeof getUser>;
const mockGetNoteById = getNoteById as MockedFunction<typeof getNoteById>;
const mockIsBoardOwnerApiTask = isBoardOwnerApiTask as MockedFunction<typeof isBoardOwnerApiTask>;

const mockNote = {
	id: 'nid_123',
	text: 'Hello world!'
};

describe('GET', () => {
	beforeEach(() => {
		mockGetUser.mockReturnValue(TE.right(mockNote) as any);
		mockGetNoteById.mockReturnValue(TE.right({ id: 'nid_123', text: 'Hello world!' }) as any);
		mockIsBoardOwnerApiTask.mockReturnValue(E.right(mockNote) as any);
	});

	it('should return a note successfully', async () => {
		const locals = { user: { id: 'uid_123' } };
		const result = await GET({
			locals,
			params: { id: 'nid_123' }
		} as any);

		expect(result.status).toBe(200);
		const data = await result.json();
		expect(data).toStrictEqual({ id: 'nid_123', text: 'Hello world!' });
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

	it('should return a 404 when user is not found', async () => {
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

	it('should return a 403 when isBoardOwner returns false', async () => {
		const apiError: ApiError = { message: 'Unauthorized', status: 403 };
		mockIsBoardOwnerApiTask.mockReturnValue(E.left(apiError));

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
