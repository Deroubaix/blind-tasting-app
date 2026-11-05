import { type Lang, formatLocale } from '../i18n';

/** "3.5" / "3,5", always with the given number of decimals. */
export function formatDecimal(value: number, lang: Lang, digits = 1): string {
	return value.toLocaleString(formatLocale(lang), { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** An average as the flight pages show it: "3" or "3.5" / "3,5", or a dash when there is none. */
export function formatAverage(value: number | null, lang: Lang): string {
	return value === null ? '—' : value.toLocaleString(formatLocale(lang), { maximumFractionDigits: 1 });
}
