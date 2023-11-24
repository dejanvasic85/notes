import { taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi, type MockedFunction, beforeEach } from 'vitest';

import { fetchAuthUser } from '$lib/auth/fetchUser';
import { createUser, getUserByAuthId } from '$lib/db/userDb';
import type { DatabaseError, RecordNotFoundError } from '$lib/types';

import { getOrCreateUserByAuth, isNoteOwner } from './userService';

vi.mock('$lib/db/userDb');
vi.mock('$lib/auth/fetchUser');

const mockGetUserByAuthId = getUserByAuthId as MockedFunction<typeof getUserByAuthId>;
const mockCreateUser = createUser as MockedFunction<typeof createUser>;
const mockFetchAuthUser = fetchAuthUser as MockedFunction<typeof fetchAuthUser>;

describe('getOrCreateUserByAuth', () => {
	const accessToken = 'access_token';
	const authId = 'sub-123';
	const mockUser = { id: 'uid_123', name: 'George Costanza', boards: [] };

	describe('when the user exists in the database', () => {
		beforeEach(() => {
			mockGetUserByAuthId.mockReturnValue(TE.right(mockUser as any));
		});

		it('should return a user from the database successfully', async () => {
			const result = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result).toBeRightStrictEqual(mockUser);
			expect(mockFetchAuthUser).not.toHaveBeenCalled();
		});
	});

	describe('when the database is not available', () => {
		const databaseError: DatabaseError = {
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error('')
		};
		beforeEach(() => {
			mockGetUserByAuthId.mockReturnValue(TE.left(databaseError));
		});

		it('should return database error and not fetch user from Auth0 when the get user fails', async () => {
			const result = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result).toBeLeftStrictEqual(databaseError);
			expect(mockFetchAuthUser).not.toHaveBeenCalled();
		});
	});

	describe('when the user does not exist in the database', () => {
		beforeEach(() => {
			const recordNotFoundError: RecordNotFoundError = {
				_tag: 'RecordNotFound',
				message: 'User with authId 123 not found'
			};

			mockGetUserByAuthId.mockReturnValue(TE.left(recordNotFoundError));
		});

		it('should fetch from Auth0 and return a newly created record', async () => {
			mockFetchAuthUser.mockResolvedValue({
				hello: 'any'
			} as any);
			mockCreateUser.mockReturnValue(TE.right(mockUser as any));

			const result = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result).toBeRightStrictEqual({
				id: 'uid_123',
				name: 'George Costanza',
				boards: []
			});
			expect(mockFetchAuthUser).toHaveBeenCalledWith({ accessToken });
		});

		it('should return a fetch error when the Auth0 fetch fails', async () => {
			mockFetchAuthUser.mockRejectedValue(new Error('You do not have internet'));

			const result = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result).toBeLeftStrictEqual({
				_tag: 'FetchError',
				message: 'Failed to fetch user with access token',
				originalError: new Error('You do not have internet')
			});
		});

		it('should return a database error when the create user fails', async () => {
			const databaseError: DatabaseError = {
				_tag: 'DatabaseError',
				message: 'Database error',
				originalError: new Error('')
			};

			mockFetchAuthUser.mockResolvedValue({
				hello: 'any'
			} as any);
			mockCreateUser.mockReturnValue(TE.left(databaseError));

			const result = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result).toBeLeftStrictEqual(databaseError);
			expect(mockFetchAuthUser).toHaveBeenCalledWith({ accessToken });
		});
	});
});

describe('isNoteOwner', () => {
	it('should return', async () => {
		const result = await isNoteOwner({
			note: { id: 'note_123', boardId: 'bid_999' },
			user: { id: 'user_123', boards: [{ id: 'bid_999' }] }
		} as any)();

		expect(result).toBeRightStrictEqual({ id: 'note_123', boardId: 'bid_999' });
	});
});
