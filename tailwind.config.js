// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				dark: colors.slate[900],
				primary: '#8f5bbd',
				secondary: '#9E6A88',
				secondaryDark: '#BF9CB5',
				tertiary: '#5C8D89',
				tertiaryDark: '#84AEAC',
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
	plugins: []
};
