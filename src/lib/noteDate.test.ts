import { describe, test, expect } from 'vitest';

import { formatNoteDate } from './noteDate';

// A Thursday, so the "recent weekday" cases stay inside the same week.
const now = new Date(2026, 6, 23, 14, 30);

describe('formatNoteDate', () => {
	test.each([
		[new Date(2026, 6, 23, 1, 0), 'Today'],
		[new Date(2026, 6, 22, 23, 59), 'Yesterday'],
		[new Date(2026, 6, 20), 'Mon'],
		[new Date(2026, 6, 17), 'Fri'],
		[new Date(2026, 6, 16), '16 Jul'],
		[new Date(2026, 0, 3), '3 Jan'],
		[new Date(2025, 11, 24), '24 Dec 2025'],
		[new Date(2026, 6, 25), '25 Jul']
	])('formats %s as %s', (value, expected) => {
		expect(formatNoteDate(value, now)).toBe(expected);
	});

	test('accepts an ISO string, as returned by the board API', () => {
		expect(formatNoteDate(new Date(2026, 6, 22, 10, 0).toISOString(), now)).toBe('Yesterday');
	});

	test.each([[null], [undefined], [''], ['not a date']])('returns null for %s', (value) => {
		expect(formatNoteDate(value, now)).toBeNull();
	});
});
