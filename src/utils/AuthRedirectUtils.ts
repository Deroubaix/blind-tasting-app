/**
 * True when the auth page was reached from Save, which sends a signed-out taster to log in with a
 * return path back to itself. The auth pages use it to say why the taster is there, in place of a
 * toast fired on the save page that would then trail after them.
 */
export function isSavingTasting(redirectTo: string) {
	return redirectTo.startsWith('/tastings/save');
}
