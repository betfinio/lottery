import type { resources } from './i18n';

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'lottery';
		resources: (typeof resources)['en'];
	}
}
