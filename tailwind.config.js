/* eslint-disable @typescript-eslint/no-require-imports */
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				dark: colors.slate[900],
				darkHover: colors.slate[700],
				darkBorder: colors.slate[700],
				darkText: '#eee',
				primary: '#8f5bbd',
				secondary: '#9E6A88',
				tertiary: '#5C8D89',
				background: '#f5f5f7'
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
			})
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
