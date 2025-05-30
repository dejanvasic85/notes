/* eslint-disable @typescript-eslint/no-require-imports */
const colors = require('tailwindcss/colors');
const spacing = require('tailwindcss/defaultTheme').spacing;

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				dark: '#282c34',
				darkHover: '#334155',
				darkBorder: '#4b5563',
				darkText: colors.slate[300],
				darkLoading: '#3c424a',
				primary: '#8f5bbd',
				secondary: '#5c8d89',
				background: '#f5f5f7',
				loading: '#e0e0e2',
				error: colors.red[500]
			},
			gridTemplateColumns: {
				layout: '[first-col] 5rem [second-col] auto'
			},
			gridTemplateRows: {
				layout: '[first-row] 5rem [second-row] auto'
			},
			gridColumn: {
				second: 'second-col'
			},
			gridRow: {
				['first-span-2']: 'first-row / span 2'
			},
			inset: {
				'auto-0-0': 'auto 0 0'
			},
			fontFamily: {
				sans: ['Poppins', 'sans-serif']
			},
			minHeight: (theme) => ({
				...theme('spacing')
			}),
			height: {
				note: spacing[72],
				friend: spacing[20]
			},
			width: {
				note: spacing[64]
			},
			zIndex: {
				menu: 10,
				overlay: 20,
				dialog: 25,
				dropdown: 30,
				toaster: 40
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
