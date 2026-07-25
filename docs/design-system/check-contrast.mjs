/**
 * Verifies every contrast ratio the design system claims.
 *
 *   node docs/design-system/check-contrast.mjs
 *
 * Exits non-zero if any pair drops below its threshold, so it can be wired
 * into CI once the tokens land in app.css.
 *
 * Thresholds are WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text and
 * non-text (borders, focus rings). Disabled controls are exempt under 1.4.3
 * but are checked here anyway — the system chooses to meet it.
 */

const light = {
	canvas: '#efedf1',
	paper: '#fcfbfd',
	raised: '#ffffff',
	ink: '#1d1b21',
	inkMuted: '#5c5764',
	inkFaint: '#6e6979',
	accent: '#7d5aa6',
	accentStrong: '#654484',
	accentSoft: '#ece5f5',
	onAccent: '#ffffff',
	onDanger: '#ffffff',
	success: '#376e50',
	successSoft: '#e2efe7',
	warning: '#8b5f20',
	warningSoft: '#f7ecd9',
	danger: '#a9452f',
	dangerSoft: '#f7e6e1'
};

const dark = {
	canvas: '#141317',
	paper: '#1c1a20',
	raised: '#26232c',
	ink: '#e8e5ec',
	inkMuted: '#a29daa',
	inkFaint: '#948f9c',
	accent: '#9b7bc4',
	accentStrong: '#b49ad4',
	accentSoft: '#2b2338',
	onAccent: '#1d1b21',
	onDanger: '#1d1b21',
	success: '#7fb894',
	successSoft: '#1c2a22',
	warning: '#d3a45f',
	warningSoft: '#2c2418',
	danger: '#dd8a76',
	dangerSoft: '#2e1e1a'
};

const notes = {
	light: {
		butter: '#fbf0cf',
		blush: '#fadfdc',
		sage: '#dfeadb',
		sky: '#dce7f4',
		lilac: '#e8e2f3',
		clay: '#f7e3d5'
	},
	dark: {
		butter: '#3a3220',
		blush: '#3b2725',
		sage: '#242e23',
		sky: '#1f2a36',
		lilac: '#2a2436',
		clay: '#3a2a20'
	}
};

const AA_TEXT = 4.5;
const AA_LARGE = 3;

const luminance = (hex) => {
	const v = hex.replace('#', '');
	const channels = [0, 2, 4]
		.map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
		.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const ratio = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

const buildChecks = (theme, t) => {
	const surfaces = [
		['canvas', t.canvas],
		['paper', t.paper],
		['raised', t.raised]
	];
	const checks = [];

	for (const [level, fg] of [
		['ink', t.ink],
		['ink-muted', t.inkMuted],
		['ink-faint', t.inkFaint]
	]) {
		for (const [name, bg] of surfaces) {
			checks.push([`${theme} ${level} on ${name}`, fg, bg, AA_TEXT]);
		}
	}

	checks.push(
		[`${theme} on-accent on accent`, t.onAccent, t.accent, AA_TEXT],
		[`${theme} on-danger on danger`, t.onDanger, t.danger, AA_TEXT],
		[`${theme} accent-strong on paper`, t.accentStrong, t.paper, AA_TEXT],
		[`${theme} ink on accent-soft`, t.ink, t.accentSoft, AA_TEXT],
		[`${theme} success on success-soft`, t.success, t.successSoft, AA_TEXT],
		[`${theme} warning on warning-soft`, t.warning, t.warningSoft, AA_TEXT],
		[`${theme} danger on danger-soft`, t.danger, t.dangerSoft, AA_TEXT],
		[`${theme} ink on raised`, t.ink, t.raised, AA_TEXT]
	);

	for (const [name, bg] of Object.entries(notes[theme])) {
		checks.push([`${theme} ink on note-${name}`, t.ink, bg, AA_TEXT]);
		checks.push([`${theme} ink-muted on note-${name}`, t.inkMuted, bg, AA_TEXT]);
	}

	return checks;
};

const results = [...buildChecks('light', light), ...buildChecks('dark', dark)];

let failed = 0;
for (const [label, fg, bg, threshold] of results) {
	const value = ratio(fg, bg);
	const ok = value >= threshold;
	if (!ok) failed++;
	const status = ok ? 'pass' : 'FAIL';
	console.log(`${status}  ${value.toFixed(2).padStart(5)}:1  (min ${threshold})  ${label}`);
}

console.log(
	`\n${results.length - failed}/${results.length} pairs pass. Large-text/non-text minimum is ${AA_LARGE}:1.`
);

if (failed > 0) {
	console.error(`\n${failed} contrast check(s) failed.`);
	process.exit(1);
}
