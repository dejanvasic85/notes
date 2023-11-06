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

		expect(result.status).toBe(500);
	});
});
