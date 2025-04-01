import { sharedLang } from 'betfinio_context/translations';
import type { i18n } from 'i18next';
import * as i18 from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import csJSON from './translations/cs.json';
import enJSON from './translations/en.json';
import ruJSON from './translations/ru.json';

export const defaultNS = 'lottery';

export const resources = {
	en: {
		lottery: enJSON,
		shared: sharedLang.en,
	},
	cs: {
		lottery: csJSON,
		shared: sharedLang.cs,
	},
	ru: {
		lottery: ruJSON,
		shared: sharedLang.ru,
	},
} as const;

const instance: i18n = i18.createInstance();
instance
	.use(initReactI18next)
	.use(I18nextBrowserLanguageDetector)
	.use(ICU)
	.init({
		resources: resources,
		supportedLngs: ['en', 'cs', 'ru'],
		lng: 'cs', // default language
		fallbackLng: 'en',
		defaultNS,
		interpolation: { escapeValue: false },
		react: { useSuspense: true },
	});

export default instance;
