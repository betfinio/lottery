import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import { dependencies } from './package.json';

const PORT = 4007;

export default defineConfig({
	server: {
		port: PORT,
	},
	dev: {
		assetPrefix: `http://localhost:${PORT}`,
		watchFiles: {
			paths: ['src/translations/**/*.json'],
		},
	},
	html: {
		title: 'Betfin Lottery',
		favicon: './src/assets/favicon.svg',
	},
	output: {
		assetPrefix: process.env.PUBLIC_OUTPUT_URL,
	},
	plugins: [
		pluginReact(),
		pluginSvgr(),
		pluginModuleFederation({
			name: 'betfinio_lottery',
			remotes: {
				betfinio_context: `betfinio_context@${process.env.PUBLIC_CONTEXT_URL}/mf-manifest.json`,
			},
			exposes: {
				'./styles': './src/styles.ts',
				'./routes/index': './src/routes/games/lottery/lotto/index.tsx',
				'./routes/$round': './src/routes/games/lottery/lotto/$round.tsx',
				'./i18n': './src/i18n.ts',
			},
			manifest: true,
			dts: true,
			shared: {
				react: {
					singleton: true,
					requiredVersion: dependencies.react,
				},
				'react-dom': {
					singleton: true,
					requiredVersion: dependencies['react-dom'],
				},
				'@tanstack/react-router': {
					singleton: true,
					requiredVersion: dependencies['@tanstack/react-router'],
				},
				'@tanstack/react-query': {
					singleton: true,
					requiredVersion: dependencies['@tanstack/react-query'],
				},
				i18next: {
					singleton: true,
					requiredVersion: dependencies.i18next,
				},
				'react-i18next': {
					singleton: true,
					requiredVersion: dependencies['react-i18next'],
				},
				wagmi: {
					singleton: true,
					requiredVersion: dependencies.wagmi,
				},
				'@privy-io/react-auth': {
					singleton: true,
					requiredVersion: dependencies['@privy-io/react-auth'],
				},
				'@privy-io/wagmi': {
					singleton: true,
					requiredVersion: dependencies['@privy-io/wagmi'],
				},
			},
		}),
	],
	tools: {
		rspack: {
			ignoreWarnings: [/Critical dependency: the request of a dependency is an expression/],
			plugins: [TanStackRouterRspack()],
		},
	},
});
