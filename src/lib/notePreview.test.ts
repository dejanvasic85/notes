import { describe, test, expect } from 'vitest';

import { getNotePreview } from './notePreview';

describe('getNotePreview', () => {
	test('prefers textPlain when it has content', () => {
		expect(getNotePreview('  Buy milk  ', '<p>Something else</p>')).toBe('Buy milk');
	});

	test('falls back to stripping tags when textPlain is empty', () => {
		expect(getNotePreview('', '<p>Buy milk</p><p>and bread</p>')).toBe('Buy milk and bread');
	});

	test('collapses the whitespace left behind by stripped tags', () => {
		expect(getNotePreview('', '<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>')).toBe('one two');
	});

	test('returns an empty string when there is nothing to show', () => {
		expect(getNotePreview('   ', '<p></p>')).toBe('');
	});
});
