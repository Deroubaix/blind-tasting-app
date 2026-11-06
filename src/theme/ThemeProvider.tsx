'use client';

import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_THEME, THEME_COOKIE, type Theme, themeColorMetas } from './index';

type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void };

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_THEME, setTheme: () => {} });

/** `theme` is read from the cookie on the server, which renders it on <html>, so there is no flash. */
export function ThemeProvider({ theme: initial, children }: { theme: Theme; children: React.ReactNode }) {
	const [theme, setThemeState] = useState(initial);

	const setTheme = (next: Theme) => {
		document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
		document.documentElement.dataset.theme = next;
		setThemeState(next);
	};

	// React hoists these into <head> and keeps them in step with the choice.
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{themeColorMetas(theme).map(({ content, media }) => (
				<meta key={content} name="theme-color" content={content} media={media} />
			))}
			{children}
		</ThemeContext.Provider>
	);
}

export const useTheme = () => useContext(ThemeContext);
