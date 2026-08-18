import { play, set, type CueName } from '@foleyjs/core';

export const soundStorageKey = 'notes:sound-muted';
const soundTheme = 'soft';

const hasDom = () => typeof document !== 'undefined';

/**
 * Anything unrecognised — absent, stale, or hand-edited — falls back to
 * unmuted, which is also the default for anyone who never opens the setting.
 */
export function readSoundMuted(): boolean {
	if (!hasDom()) {
		return false;
	}

	try {
		return localStorage.getItem(soundStorageKey) === 'true';
	} catch {
		return false;
	}
}

export function applySoundMuted(muted: boolean): void {
	set({ muted });

	if (!hasDom()) {
		return;
	}

	try {
		localStorage.setItem(soundStorageKey, String(muted));
	} catch {
		/* private browsing and full quotas both throw; the setting still applied for this session */
	}
}

export function initSound(): void {
	set({ theme: soundTheme, muted: readSoundMuted() });
}

export function playCue(name: CueName): void {
	if (!hasDom()) {
		return;
	}

	play(name);
}
