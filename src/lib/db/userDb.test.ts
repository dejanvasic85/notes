import { describe, it, vi, type Mocked, expect, beforeEach } from 'vitest';
import db from '$lib/db';

import { getUserByIdTask } from './userDb';

vi.mock('$lib/db', () => ({
	default: {
		user: {
			findUnique: vi.fn()
		}
	}
}));

const dbUserMock = db.user as Mocked<typeof db.user>;

describe('getUserByIdTask', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return a user successfully', async () => {
		dbUserMock.findUnique.mockResolvedValue({
			id: 'hello world',
			name: 'Goerge Costanza',
			boards: [
				{
					id: 'bid_123',
					notes: [
						{
							id: 'nid_333',
							text: 'hello world'
						}
					]
				}
			]
		} as any);

		const result = await getUserByIdTask({ id: 'uid_123', includeBoards: false })();
		expect(result).toBeRightStrictEqual({
			id: 'hello world',
			name: 'Goerge Costanza',
			boards: []
		});
	});

	it('should return a user with boards successfully', async () => {
		dbUserMock.findUnique.mockResolvedValue({
			id: 'hello world',
			name: 'Goerge Costanza',
			boards: [
				{
					id: 'bid_123',
					notes: []
				}
			]
		} as any);

		const result = await getUserByIdTask({ id: 'uid_123', includeBoards: true })();
		expect(result).toBeRightStrictEqual({
			id: 'hello world',
			name: 'Goerge Costanza',
			boards: [
				{
					id: 'bid_123',
					notes: []
				}
			]
		});
	});

	it('should return RecordNotFoundError when the user is null', async () => {
		dbUserMock.findUnique.mockResolvedValue(null as any);

		const result = await getUserByIdTask({ id: 'uid_123' })();
		expect(result).toBeLeftStrictEqual({
			_tag: 'RecordNotFound',
			message: 'User with id uid_123 not found'
		});
	});

	it('should return a DatabaseError when the db throws an error', async () => {
		dbUserMock.findUnique.mockRejectedValue(new Error('Something went wrong'));

		const result = await getUserByIdTask({ id: 'uid_123' })();
		expect(result).toBeLeftStrictEqual({
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error('Something went wrong')
		});
	});
});
