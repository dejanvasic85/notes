/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			minHeight: (theme) => ({
				...theme('spacing')
			}),
			fontFamily: {
				sans: ['Open-Sans']
			}
		}
	},
	plugins: []
};
