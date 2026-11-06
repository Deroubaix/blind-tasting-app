import { cookies } from 'next/headers';
import { THEME_COOKIE, type Theme, themeOf } from './index';

/** The appearance for this request, from the `theme` cookie; light when unset. */
export async function getTheme(): Promise<Theme> {
	return themeOf((await cookies()).get(THEME_COOKIE)?.value);
}
