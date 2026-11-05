import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { type Dict, LANG_COOKIE, type Lang, langOf } from './index';

/** The interface language for this request, from the `lang` cookie; English when unset. */
export async function getLang(): Promise<Lang> {
	return langOf((await cookies()).get(LANG_COOKIE)?.value);
}

export async function getText<T>(d: Dict<T>): Promise<Dict<T>[Lang]> {
	return d[await getLang()];
}

/** `export const generateMetadata = pageTitle({ en: 'Account', pt: 'Conta' });` */
export const pageTitle = (titles: Record<Lang, string>) => async (): Promise<Metadata> => ({
	title: titles[await getLang()],
});
