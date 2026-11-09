'use client';

import { useLang } from './LanguageProvider';
import { LISTED, termIn } from './terms';

/** `term('Medium', 'Body')` → "Médio" on the Portuguese site; the English term otherwise. */
export function useTerm() {
	const { lang } = useLang();
	return (en: string, question?: string) => termIn(lang, en, question);
}

/** A reveal field's value for display: `fieldValue('readiness', 'Too young')`. */
export function useFieldValue() {
	const term = useTerm();
	return (key: string, value: string) => (key in LISTED ? term(value, LISTED[key]) : value);
}
