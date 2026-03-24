import { describe, expect, it, vi } from 'vitest';

import type { Board } from '$lib/types';

import { isBoardOwner } from './userService';

vi.mock('$lib/server/db/userDb');
vi.mock('$lib/auth/fetchUser');
vi.mock('$lib/server/services/emailService');

describe('isBoardOwner', () => {
	it('should return board when the user has access', () => {
		const board = { id: 'board_id', userId: 'user_one' } as Board;
		const result = isBoardOwner({
			userId: 'user_one',
			board
		});

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toEqual(board);
	});

	it('should return not authorized error when the user does not own the board', () => {
		const board = { id: 'board_id', userId: 'user_two' } as Board;
		const result = isBoardOwner({
			userId: 'user_one',
			board
		});

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr()).toEqual({
			_tag: 'AuthorizationError',
			message: 'User user_one is not the owner of board board_id'
		});
	});
});
