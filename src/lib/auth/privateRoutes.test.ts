import { matchesPrivateRoute } from './privateRoutes';
import { describe, test, expect } from 'vitest';

describe('privateRoutes', () => {
	test.each([
		['/my/board', true],
		['/my/friends', true],
		['/api/auth', false],
		['/api/board', true],
		['/api/user', true],
		['/api/notes', true]
	])('matchesPrivateRoute %s %s', (path, expectedResult) => {
		expect(matchesPrivateRoute(path)).toBe(expectedResult);
	});
});
