/**
 * True when the auth page was reached from Save, which sends a signed-out taster to log in with a
 * return path back to itself. The auth pages use it to say why the taster is there, in place of a
 * toast fired on the save page that would then trail after them.
 */
export function isSavingTasting(redirectTo: string) {
	return redirectTo.startsWith('/tastings/save');
}

/** Where the auth pages send someone when there is no usable return path. */
export const DEFAULT_AFTER_LOGIN = '/archives';

// A made-up origin to resolve against: anything that still has it afterwards stayed on this app.
const SAME_APP = 'https://app.invalid';

/**
 * The `?r=` return path, if it keeps the user on this app; otherwise the archive.
 *
 * `r` comes from the URL, so anyone can write it. Unchecked, `/login?r=https://evil.site` sends
 * someone off-site straight after a genuine login — a trusted page vouching for a phishing one.
 * Resolving it as a URL and comparing the origin is what catches the tricky forms a prefix check
 * misses: browsers read `//evil.site`, `/\evil.site` and `/<tab>/evil.site` as another host.
 */
export function safeRedirect(returnTo: string | null | undefined): string {
	if (!returnTo || !returnTo.startsWith('/')) {
		return DEFAULT_AFTER_LOGIN;
	}
	try {
		const url = new URL(returnTo, SAME_APP);
		if (url.origin !== SAME_APP) {
			return DEFAULT_AFTER_LOGIN;
		}
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return DEFAULT_AFTER_LOGIN;
	}
}
