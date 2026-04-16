import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import { pluginManifest } from './scripts/plugin-fetch-manifest';

const PORT = 4007;

export default defineConfig({
	server: {
		port: PORT,
		cors: {
			origin: '*',
		},
	},
	dev: {
		assetPrefix: `http://localhost:${PORT}`,
		lazyCompilation: false,
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
		filenameHash: false,
	},
	plugins: [
		pluginReact(),
		pluginSvgr(),
		pluginModuleFederation(
			{
				name: 'betfinio_lottery',
				remotes: {
					betfinio_context: `betfinio_context@${process.env.PUBLIC_CONTEXT_URL}/mf-manifest.json`,
				},
				exposes: {
					'./style': './src/local.css',
					'./route/lotto': './src/routes/games/lottery/lotto/index.tsx',
					'./route/lotto/round': './src/routes/games/lottery/lotto/$round.tsx',
					'./i18n': './src/i18n.ts',
				},
				manifest: true,
				dts: {
					consumeTypes: {
						typesOnBuild: true,
					},
				},
				shared: [
					'react',
					'react-dom',
					'@tanstack/react-router',
					'@tanstack/react-query',
					'i18next',
					'react-i18next',
					'wagmi',
					'@privy-io/react-auth',
					'@privy-io/wagmi',
					'@betfinio/components',
				],
			},
			{},
		),
		pluginManifest({
			remoteName: 'betfinio_context',
			manifestUrl: process.env.PUBLIC_CONTEXT_URL || '',
			outputDir: '@mf-types/source',
		}),
	],
	tools: {
		rspack: {
			ignoreWarnings: [/Critical dependency: the request of a dependency is an expression/],
			plugins: [TanStackRouterRspack()],
		},
	},
});
