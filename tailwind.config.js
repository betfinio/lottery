import preset from '@betfinio/components/tailwind-config';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	important: '.lottery',
	presets: [preset],
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				gold: 'hsl(var(--gold))',
				silver: 'hsl(var(--silver))',
				bronze: 'hsl(var(--bronze))',
				aura: 'hsl(var(--aura))',
			},
			fontFamily: {
				sans: ['Quicksand', 'sans-serif'],
			},
			backgroundImage: {
				'primary-gradient': 'linear-gradient(to left, #1D1A3D, #7366FF 40%, #1D1A3D)',
			},
			gridTemplateRows: {
				13: 'repeat(13, minmax(0, 1fr))',
			},
		},
	},
	plugins: [animate],
};
