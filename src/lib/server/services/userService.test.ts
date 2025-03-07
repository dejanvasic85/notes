import { taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi, type MockedFunction, beforeEach } from 'vitest';

import { fetchAuthUser } from '$lib/auth/fetchUser';
import { createUser, getUserByAuthId } from '$lib/server/db/userDb';
import type { Board, DatabaseError, RecordNotFoundError } from '$lib/types';

import { getOrCreateUserByAuth, isBoardOwner } from './userService';

vi.mock('$lib/server/db/userDb');
vi.mock('$lib/auth/fetchUser');
vi.mock('$lib/server/services/emailService');

const mockGetUserByAuthId = getUserByAuthId as MockedFunction<typeof getUserByAuthId>;
const mockCreateUser = createUser as MockedFunction<typeof createUser>;
const mockFetchAuthUser = fetchAuthUser as MockedFunction<typeof fetchAuthUser>;

describe('isBoardOwner', () => {
	it('should return board when the user has access', async () => {
		const board = { id: 'board_id', userId: 'user_one' } as Board;
		const result: any = await isBoardOwner({
			userId: 'user_one',
			board
		})();

		expect(result._tag).toBe('Right');
		expect(result.right).toEqual(board);
	});

	it('should return not authorized error when the user does not own the board', async () => {
		const board = { id: 'board_id', userId: 'user_two' } as Board;
		const result: any = await isBoardOwner({
			userId: 'user_one',
			board
		})();

		expect(result._tag).toBe('Left');
		expect(result.left).toEqual({
			_tag: 'AuthorizationError',
			message: 'User user_one is not the owner of board board_id'
		});
	});
});

describe('getOrCreateUserByAuth', () => {
	const accessToken = 'access_token';
	const authId = 'sub-123';
	const mockUser = { id: 'uid_123', name: 'George Costanza', boards: [] };

	describe('when the user exists in the database', () => {
		beforeEach(() => {
			mockGetUserByAuthId.mockReturnValue(TE.right(mockUser as any));
		});

		it('should return a user from the database successfully', async () => {
			const result: any = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result._tag).toBe('Right');
			expect(result.right).toEqual(mockUser);
			expect(mockFetchAuthUser).not.toHaveBeenCalled();
		});
	});

	describe('when the database is not available', () => {
		const databaseError: DatabaseError = {
			_tag: 'DatabaseError',
			message: 'Unexpected database error occurred',
			originalError: new Error('')
		};
		beforeEach(() => {
			mockGetUserByAuthId.mockReturnValue(TE.left(databaseError));
		});

		it('should return Unexpected database error occurred and not fetch user from Auth0 when the get user fails', async () => {
			const result: any = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result._tag).toBe('Left');
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

			const result: any = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result._tag).toBe('Right');
			expect(result.right).toEqual(mockUser);
			expect(mockFetchAuthUser).toHaveBeenCalledWith({ accessToken });
		});

		it('should return a fetch error when the Auth0 fetch fails', async () => {
			mockFetchAuthUser.mockRejectedValue(new Error('You do not have internet'));

			const result: any = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result._tag).toBe('Left');
			expect(result.left).toEqual({
				_tag: 'FetchError',
				message: 'Failed to fetch user with access token',
				originalError: new Error('You do not have internet')
			});
		});

		it('should return a Unexpected database error occurred when the create user fails', async () => {
			const databaseError: DatabaseError = {
				_tag: 'DatabaseError',
				message: 'Unexpected database error occurred',
				originalError: new Error('')
			};

			mockFetchAuthUser.mockResolvedValue({
				hello: 'any'
			} as any);
			mockCreateUser.mockReturnValue(TE.left(databaseError));

			const result: any = await getOrCreateUserByAuth({ accessToken, authId })();

			expect(result._tag).toBe('Left');
			expect(result.left).toEqual(databaseError);
			expect(mockFetchAuthUser).toHaveBeenCalledWith({ accessToken });
		});
	});
});
