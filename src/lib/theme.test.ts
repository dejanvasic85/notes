import { describe, test, expect } from 'vitest';

import { resolveThemePreference } from './theme';

describe('resolveThemePreference', () => {
	test('keeps a recognised preference', () => {
		expect(resolveThemePreference('light')).toBe('light');
		expect(resolveThemePreference('dark')).toBe('dark');
		expect(resolveThemePreference('system')).toBe('system');
	});

	test('falls back to system when nothing is stored', () => {
		expect(resolveThemePreference(null)).toBe('system');
	});

	test('falls back to system for an unrecognised value', () => {
		expect(resolveThemePreference('sepia')).toBe('system');
		expect(resolveThemePreference('')).toBe('system');
	});

	test('does not treat inherited Object properties as preferences', () => {
		expect(resolveThemePreference('toString')).toBe('system');
		expect(resolveThemePreference('constructor')).toBe('system');
	});
});
