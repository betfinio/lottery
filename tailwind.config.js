/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	important: '.template',
	presets: [require('@betfinio/components/tailwind-config')],
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [require('tailwindcss-animate')],
};
