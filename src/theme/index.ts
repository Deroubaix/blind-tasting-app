export const THEMES = ['light', 'dark', 'auto'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = 'light';
export const THEME_COOKIE = 'theme';

export const themeOf = (value: unknown): Theme => (THEMES.includes(value as Theme) ? (value as Theme) : DEFAULT_THEME);

/** The browser chrome colour: the page ground. Auto gives one per system setting. */
export function themeColorMetas(theme: Theme): { content: string; media?: string }[] {
	const light = '#f5efe4';
	const dark = '#1c1816';
	if (theme === 'auto') {
		return [
			{ content: light, media: '(prefers-color-scheme: light)' },
			{ content: dark, media: '(prefers-color-scheme: dark)' },
		];
	}
	return [{ content: theme === 'dark' ? dark : light }];
}
