/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	important: '.lottery',
	presets: [require('@betfinio/components/tailwind-config')],
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Rubik'],
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
