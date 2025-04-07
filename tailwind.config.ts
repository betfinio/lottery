/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	important: '.lottery',
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			backgroundImage: {
				'primary-gradient': 'linear-gradient(to left, #1D1A3D, #7366FF 40%, #1D1A3D)',
			},
			gridTemplateRows: {
				13: 'repeat(13, minmax(0, 1fr))',
			},
		},
	},
};
