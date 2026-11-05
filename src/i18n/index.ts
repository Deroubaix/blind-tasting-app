/** Tasting vocabulary (grid descriptors, scale terms, stored keys) stays English: scoring and saved data depend on it. */
export const LANGS = ['en', 'pt'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'lang';
export const LANG_NAMES: Record<Lang, string> = { en: 'English', pt: 'Português' };
/** BCP 47 tags for `<html lang>` and date formatting; the Portuguese is European. */
export const LOCALES: Record<Lang, string> = { en: 'en', pt: 'pt-PT' };

/** The locale dates and numbers are written in: US English rather than the bare `en`. */
export const formatLocale = (lang: Lang) => (lang === 'en' ? 'en-US' : LOCALES[lang]);

export const langOf = (value: unknown): Lang => (value === 'pt' ? 'pt' : DEFAULT_LANG);

/** A string, a function that builds one, a list of strings, or a nested group of those. */
export type Strings = {
	readonly [key: string]: string | ((...args: never[]) => string) | readonly string[] | Strings;
};

/** The shape of a dictionary with the English literals widened, so `pt` must match key for key. */
export type Shape<T> = {
	readonly [K in keyof T]: T[K] extends string
		? string
		: T[K] extends (...args: infer A) => string
			? (...args: A) => string
			: T[K] extends readonly string[]
				? readonly string[]
				: Shape<T[K]>;
};

export type Dict<T> = Readonly<Record<Lang, Shape<T>>>;

export const dict = <T extends Strings>(en: T, pt: Shape<T>): Dict<T> => ({ en: en as unknown as Shape<T>, pt });
