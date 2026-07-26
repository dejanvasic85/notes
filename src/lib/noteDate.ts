/*
 * Board cards show when a note was last touched. The value arrives as a Date
 * from the database but as an ISO string once it has been through JSON (the
 * board is fetched client-side and cached in localStorage), so both are
 * accepted here rather than trusting the declared type.
 */

const millisecondsPerDay = 86_400_000;
const recentDayLimit = 7;

/*
 * The locale is pinned rather than taken from the browser: "Today" and
 * "Yesterday" beside it are hard-coded English, and a day-month order matches
 * the board mockup in docs/design-system/preview.html.
 */
const dateLocale = 'en-GB';

const weekdayFormat = new Intl.DateTimeFormat(dateLocale, { weekday: 'short' });
const sameYearFormat = new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'short' });
const otherYearFormat = new Intl.DateTimeFormat(dateLocale, {
	day: 'numeric',
	month: 'short',
	year: 'numeric'
});

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatNoteDate(
	value: Date | string | null | undefined,
	now: Date = new Date()
): string | null {
	if (!value) {
		return null;
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / millisecondsPerDay);

	if (daysAgo === 0) {
		return 'Today';
	}
	if (daysAgo === 1) {
		return 'Yesterday';
	}
	if (daysAgo > 1 && daysAgo < recentDayLimit) {
		return weekdayFormat.format(date);
	}
	if (date.getFullYear() === now.getFullYear()) {
		return sameYearFormat.format(date);
	}

	return otherYearFormat.format(date);
}
