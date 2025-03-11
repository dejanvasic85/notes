import { describe, expect, it, vi } from 'vitest';

import type { Board } from '$lib/types';

import { isBoardOwner } from './userService';

vi.mock('$lib/server/db/userDb');
vi.mock('$lib/auth/fetchUser');
vi.mock('$lib/server/services/emailService');

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
