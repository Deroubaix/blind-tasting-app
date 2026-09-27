// Matching for the conclusion search boxes. Accent- and case-insensitive, because grape and
// region names are full of accents that nobody types under a timer: "carmenere" should find
// Carménère and "gruner" should find Grüner Veltliner.

export function fold(text: string) {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

/** The suggestions containing what has been typed so far. Nothing until something is typed. */
export function matchSuggestions(typed: string, suggestions: string[]): string[] {
	const needle = fold(typed);
	if (!needle) {
		return [];
	}
	return suggestions.filter((s) => fold(s).includes(needle));
}

/**
 * What Enter commits when no suggestion is highlighted. The listed name wins when the typing
 * can only mean one thing — it is that name already, or it matches exactly one suggestion — so
 * "carm" + Enter becomes "Carménère" rather than a chip reading "carm". Anything else is taken
 * as typed, which is how a wine outside the list still gets named.
 */
export function resolveEnter(typed: string, suggestions: string[]): string {
	const exact = suggestions.find((s) => fold(s) === fold(typed));
	if (exact) {
		return exact;
	}
	const matches = matchSuggestions(typed, suggestions);
	return matches.length === 1 ? matches[0] : typed.trim();
}
