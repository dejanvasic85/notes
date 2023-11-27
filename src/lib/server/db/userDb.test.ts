import { describe, it, vi, type Mocked, expect, beforeEach } from 'vitest';
import db from '$lib/server/db';

import { getUser, getUserByAuthId, createUser } from './userDb';

vi.mock('$lib/server/db', () => ({
	default: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn()
		}
	}
}));

const dbUserMock = db.user as Mocked<typeof db.user>;

describe('getUser', () => {
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

		const result = await getUser({ id: 'uid_123', includeBoards: false })();
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

		const result = await getUser({ id: 'uid_123', includeBoards: true })();
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

		const result = await getUser({ id: 'uid_123' })();
		expect(result).toBeLeftStrictEqual({
			_tag: 'RecordNotFound',
			message: 'User with id uid_123 not found'
		});
	});

	it('should return a DatabaseError when the db throws an error', async () => {
		dbUserMock.findUnique.mockRejectedValue(new Error('Something went wrong'));

		const result = await getUser({ id: 'uid_123' })();
		expect(result).toBeLeftStrictEqual({
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error('Something went wrong')
		});
	});
});

describe('getUserByAuthId', () => {
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

		const result = await getUserByAuthId('auth_123')();
		expect(result).toBeRightStrictEqual({
			id: 'hello world',
			name: 'Goerge Costanza',
			boards: []
		});
	});

	it('should return RecordNotFoundError when the user is null', async () => {
		dbUserMock.findUnique.mockResolvedValue(null as any);

		const result = await getUserByAuthId('auth_123')();
		expect(result).toBeLeftStrictEqual({
			_tag: 'RecordNotFound',
			message: 'User with authId auth_123 not found'
		});
	});

	it('should return a DatabaseError when the db throws an error', async () => {
		dbUserMock.findUnique.mockRejectedValue(new Error('Something went wrong'));

		const result = await getUserByAuthId('auth_123')();
		expect(result).toBeLeftStrictEqual({
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error('Something went wrong')
		});
	});
});

describe('createUser', () => {
	it('should create a user successfully', async () => {
		dbUserMock.create.mockResolvedValue({
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

		const result = await createUser({
			authUserProfile: {
				email: 'email@foobar.com',
				email_verified: true,
				name: 'name',
				picture: 'picture',
				sub: 'sub',
				nickname: 'nickname',
				updated_at: 'updated_at'
			}
		})();

		expect(result._tag).toBe('Right');
	});

	it('should return a DatabaseError when the db throws an error', async () => {
		dbUserMock.create.mockRejectedValue(new Error('Something went wrong'));

		const result = await createUser({
			authUserProfile: {
				email: 'email@foobar.com',
				email_verified: true,
				name: 'name',
				picture: 'picture',
				sub: 'sub',
				nickname: 'nickname',
				updated_at: 'updated_at'
			}
		})();

		expect(result).toBeLeftStrictEqual({
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error('Something went wrong')
		});
	});
});
