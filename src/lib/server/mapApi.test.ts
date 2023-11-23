import { describe, expect, test } from 'vitest';

import type { ErrorType } from '$lib/types';

import { createError } from './createError';
import { mapToApiError } from './mapApi';

describe('mapToApiError', () => {
	test.each([
		[
			'DatabaseError',
			'A database error occurred',
			{ status: 500, message: 'A database error occurred' }
		],
		['FetchError', 'A fetch error occurred', { status: 500, message: 'A fetch error occurred' }],
		[
			'RecordNotFound',
			'A record was not found',
			{ status: 404, message: 'A record was not found' }
		],
		[
			'ValidationError',
			'A validation error occurred',
			{ status: 400, message: 'A validation error occurred' }
		]
	])(`should map a %s to an ApiError`, (tag, message, expected) => {
		const err = createError(tag as ErrorType, message)(new Error());
		const result = mapToApiError(err);
		expect(result).toEqual(expected);
	});
});
