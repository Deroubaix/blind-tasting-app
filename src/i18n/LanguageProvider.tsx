'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Dict, DEFAULT_LANG, LANG_COOKIE, type Lang } from './index';

type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void };

const LanguageContext = createContext<LanguageContextValue>({ lang: DEFAULT_LANG, setLang: () => {} });

/** `lang` is read from the cookie on the server, so the first render already matches. */
export function LanguageProvider({ lang: initial, children }: { lang: Lang; children: React.ReactNode }) {
	const router = useRouter();
	const [lang, setLangState] = useState(initial);

	const setLang = (next: Lang) => {
		// A year; not HttpOnly, so the switch can set it without a round trip.
		document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
		setLangState(next);
		// Server components (<html lang>, metadata) re-render from the cookie.
		router.refresh();
	};

	return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);

/** The current language's half of a dictionary: `const t = useText(headerText);`. */
export function useText<T>(d: Dict<T>): Dict<T>[Lang] {
	return d[useLang().lang];
}
