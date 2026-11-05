import { DEFAULT_LANG, type Lang, formatLocale } from '../i18n';

/** "September 28, 2026" / "28 de setembro de 2026": the one date format across the app. */
export function formatDate(value: string | Date, lang: Lang = DEFAULT_LANG): string {
	return new Date(value).toLocaleDateString(formatLocale(lang), { year: 'numeric', month: 'long', day: 'numeric' });
}

/** "7:14 PM" / "19:14". */
export function formatTime(value: string | Date, lang: Lang = DEFAULT_LANG): string {
	return new Date(value).toLocaleTimeString(formatLocale(lang), { hour: 'numeric', minute: '2-digit' });
}

export function formatMonth(value: string | Date, lang: Lang, month: 'long' | 'short', timeZone?: string): string {
	return new Date(value).toLocaleDateString(formatLocale(lang), { month, timeZone });
}

/** "November 2026" / "novembro de 2026". */
export function formatMonthYear(value: string | Date, lang: Lang, timeZone?: string): string {
	return new Date(value).toLocaleDateString(formatLocale(lang), { month: 'long', year: 'numeric', timeZone });
}

/** "Nov 4" / "4 nov.": pt-PT's own short form is "4/11", which reads as a fraction beside a score. */
export function formatShortDate(value: string | Date, lang: Lang, timeZone?: string): string {
	const date = new Date(value);
	if (lang === 'en') {
		return date.toLocaleDateString(formatLocale(lang), { month: 'short', day: 'numeric', timeZone });
	}
	const day = date.toLocaleDateString(formatLocale(lang), { day: 'numeric', timeZone });
	return `${day} ${formatMonth(date, lang, 'short', timeZone)}`;
}
