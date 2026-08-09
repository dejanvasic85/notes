export default {
	extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
	rules: {
		// Tailwind v4 theme keys use a `--` separator for compound sub-properties
		// (eg. --text-body--line-height), on top of the usual kebab-case base name.
		'custom-property-pattern': [
			'^([a-z][a-z0-9]*)(-[a-z0-9]+)*(--([a-z][a-z0-9]*)(-[a-z0-9]+)*)?$',
			{ message: (name) => `Expected custom property name "${name}" to be kebab-case` }
		],
		// Blank lines group related design tokens into subsections; that's intentional here.
		'custom-property-empty-line-before': null,
		// False positive: `&` inside `@custom-variant ... { @slot; }` is valid Tailwind v4
		// syntax, but stylelint doesn't recognise @custom-variant as a scoping root.
		'nesting-selector-no-missing-scoping-root': null
	},
	overrides: [
		{
			files: ['**/*.svelte'],
			customSyntax: 'postcss-html'
		}
	]
};
