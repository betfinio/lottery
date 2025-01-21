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
	},
	html: {
		title: 'Betfin Lottery',
		favicon: './src/assets/favicon.svg',
		meta: {
			'og:image': 'https://picsum.photos/200/300',
		},
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
			},
		}),
	],
	tools: {
		rspack: {
			output: {
				uniqueName: 'betfinio_lottery',
			},
			ignoreWarnings: [/Critical dependency: the request of a dependency is an expression/],

			plugins: [TanStackRouterRspack()],
		},
	},
});
