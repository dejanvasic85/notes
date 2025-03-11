import { describe, it, vi, type Mocked, expect } from 'vitest';
import db from '$lib/server/db';

import { getUser, createUser, getUserByNoteId } from './userDb';

vi.mock('$lib/server/db', () => ({
	default: {
		user: {
			findFirst: vi.fn(),
			create: vi.fn()
		},
		note: {
			findFirst: vi.fn()
		}
	}
}));

const dbUserMock = db.user as Mocked<typeof db.user>;
const dbNoteMock = db.note as Mocked<typeof db.note>;

describe('getUser', () => {
	it('should return a user successfully', async () => {
		dbUserMock.findFirst.mockResolvedValue({
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

		const result: any = await getUser({ id: 'uid_123', includeBoards: false })();

		expect(result._tag).toBe('Right');
		expect(result.right).toEqual({ id: 'hello world', name: 'Goerge Costanza', boards: [] });
	});

	it('should return a user with boards successfully', async () => {
		dbUserMock.findFirst.mockResolvedValue({
			id: 'hello world',
			name: 'Goerge Costanza',
			boards: [
				{
					id: 'bid_123',
					notes: []
				}
			]
		} as any);

		const result: any = await getUser({ id: 'uid_123', includeBoards: true })();

		expect(result._tag).toBe('Right');
		expect(result.right).toEqual({
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
		dbUserMock.findFirst.mockResolvedValue(null as any);

		const result: any = await getUser({ id: 'uid_123' })();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'RecordNotFound',
			message: 'User with id uid_123 not found',
			originalError: undefined
		});
	});

	it('should return a DatabaseError when the db throws an error', async () => {
		dbUserMock.findFirst.mockRejectedValue(new Error('Something went wrong'));

		const result: any = await getUser({ id: 'uid_123' })();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'DatabaseError',
			message: 'Unexpected database error occurred',
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

		const result: any = await createUser({
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

		const result: any = await createUser({
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

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'DatabaseError',
			message: 'Unexpected database error occurred',
			originalError: new Error('Something went wrong')
		});
	});
});

describe('getUserByNoteId', () => {
	it('should query notes by id from the database', async () => {
		dbNoteMock.findFirst.mockResolvedValue({
			board: {
				user: { id: 'uid_123', name: 'Goerge Costanza' }
			}
		} as any);

		const result: any = await getUserByNoteId('note_id')();
		expect(result._tag).toBe('Right');
		expect(result.right).toEqual({ id: 'uid_123', name: 'Goerge Costanza', boards: [] });
	});

	it('should return RecordNotFoundError when the user is null', async () => {
		dbNoteMock.findFirst.mockResolvedValue(null);

		const result: any = await getUserByNoteId('note_id')();
		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'RecordNotFound',
			message: 'User for note note_id not found'
		});
	});
});
