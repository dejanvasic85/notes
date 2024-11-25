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
				primary: '#8f5bbd',
				secondary: '#9E6A88',
				tertiary: '#5C8D89',
				background: '#f5f5f7'
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
