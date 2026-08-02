export const themePreferences = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof themePreferences)[number];

/*
 * Both mirrored by the pre-paint script in src/app.html, which cannot import
 * from here. Change one, change the other.
 */
export const themeStorageKey = 'notes:theme';
export const themeAttribute = 'data-theme';

const knownPreferences: ReadonlySet<string> = new Set(themePreferences);

const isThemePreference = (value: string): value is ThemePreference => knownPreferences.has(value);

/**
 * Anything unrecognised — absent, stale, or hand-edited — falls back to
 * System, which is also the default for anyone who never opens the setting.
 */
export const resolveThemePreference = (stored: string | null): ThemePreference =>
	stored !== null && isThemePreference(stored) ? stored : 'system';

const hasDom = () => typeof document !== 'undefined';

const themeColorSelector = 'meta[name="theme-color"]';
const schemeColorAttribute = 'data-scheme-color';
const paperProperty = '--color-paper';

/*
 * The two theme-color tags in app.html are scheme-scoped, so they follow the OS
 * on their own. An explicit Light or Dark can disagree with the OS, though, and
 * a media query cannot see the data-theme attribute — so point both tags at the
 * resolved --color-paper instead, and hand them back when System returns.
 *
 * Reading the computed token rather than repeating the hex keeps this in step
 * with app.css automatically.
 *
 * System restores from each tag's data-scheme-color, not from whatever `content`
 * held at startup: the pre-paint script in app.html may already have overwritten
 * it for a stored preference, so the live value is not a reliable original.
 */
function syncThemeColorMeta(preference: ThemePreference): void {
	const tags = document.querySelectorAll(themeColorSelector);

	if (preference === 'system') {
		for (const tag of tags) {
			const schemeColor = tag.getAttribute(schemeColorAttribute);
			if (schemeColor) {
				tag.setAttribute('content', schemeColor);
			}
		}
		return;
	}

	const paper = getComputedStyle(document.documentElement).getPropertyValue(paperProperty).trim();
	if (!paper) {
		return;
	}

	for (const tag of tags) {
		tag.setAttribute('content', paper);
	}
}

export function readThemePreference(): ThemePreference {
	if (!hasDom()) {
		return 'system';
	}

	try {
		return resolveThemePreference(localStorage.getItem(themeStorageKey));
	} catch {
		return 'system';
	}
}

/**
 * System deliberately clears the attribute rather than resolving the OS
 * preference to a concrete value: leaving it off lets the media query in
 * app.css do the work, so the theme keeps following the OS while the page is
 * open without a matchMedia listener.
 *
 * The attribute is stamped before persisting, so a storage failure still
 * changes the theme for this session instead of appearing to do nothing.
 */
export function applyThemePreference(preference: ThemePreference): void {
	if (!hasDom()) {
		return;
	}

	if (preference === 'system') {
		document.documentElement.removeAttribute(themeAttribute);
	} else {
		document.documentElement.setAttribute(themeAttribute, preference);
	}

	syncThemeColorMeta(preference);

	try {
		if (preference === 'system') {
			localStorage.removeItem(themeStorageKey);
		} else {
			localStorage.setItem(themeStorageKey, preference);
		}
	} catch {
		/* private browsing and full quotas both throw; the theme still applied */
	}
}
