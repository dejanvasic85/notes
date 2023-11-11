import { describe, it, expect } from 'vitest';

import type { DatabaseError, RecordNotFoundError } from '$lib/types';

import { mapToApiError } from './mapApi';

describe('mapToApiError', () => {
	it('should map a DatabaseError to an ApiError', () => {
		const err: DatabaseError = {
			_tag: 'DatabaseError',
			message: 'Database error',
			originalError: new Error()
		};
		const result = mapToApiError(err);
		expect(result).toStrictEqual({ status: 500, message: 'Database error' });
	});

	it('should map a RecordNotFound to an ApiError', () => {
		const err: RecordNotFoundError = {
			_tag: 'RecordNotFound',
			message: 'Record not found'
		};

		const result = mapToApiError(err);

		expect(result).toStrictEqual({ status: 404, message: 'Record not found' });
	});
});
