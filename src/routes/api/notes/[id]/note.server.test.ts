import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';

import { getUserById, isBoardOwner } from '$lib/services/userService';
import { getNoteById } from '$lib/services/noteService';
import { GET } from './+server';

vi.mock('$lib/services/userService');
vi.mock('$lib/services/noteService');

const getUserByIdMock = getUserById as MockedFunction<typeof getUserById>;
const getNoteByIdMock = getNoteById as MockedFunction<typeof getNoteById>;
const isBoardOwnerMock = isBoardOwner as MockedFunction<typeof isBoardOwner>;

describe('GET', () => {
	beforeEach(() => {
		getUserByIdMock.mockResolvedValue({ id: 'uid_123' } as any);
		getNoteByIdMock.mockResolvedValue({ id: 'nid_123', text: 'Hello world!' } as any);
		isBoardOwnerMock.mockReturnValue(true);
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
		getUserByIdMock.mockRejectedValue(new Error('User not found'));

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
		getNoteByIdMock.mockRejectedValue(new Error('Note not found'));

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
		isBoardOwnerMock.mockReturnValue(false);

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
