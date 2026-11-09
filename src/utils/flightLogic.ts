// Flight rules as plain data, shared by the API and the pages, and pinned by flightLogic.test.ts.

import { PALATE_OPTIONS } from '../components/palate/palateFields';
import { WSET_PALATE } from '../components/wset/wsetFields';
import { type Grid } from '../data/grids';
import { flightsText } from '../i18n/flights';

/** No 0/O or 1/I/L, so a code read across a table can't be misread. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;
export const MAX_WINES = 12;

/** From the platform's secure random source; bytes past the last whole alphabet are redrawn so no letter is favoured. */
export function newFlightCode(): string {
	const limit = 256 - (256 % CODE_ALPHABET.length);
	let code = '';
	while (code.length < CODE_LENGTH) {
		for (const byte of crypto.getRandomValues(new Uint8Array(CODE_LENGTH))) {
			if (byte < limit && code.length < CODE_LENGTH) {
				code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
			}
		}
	}
	return code;
}

/** Uppercased, with spaces, dashes and the dot dropped: " b7k-q4m " → "B7KQ4M". */
export function normalizeCode(input: string): string {
	return input
		.toUpperCase()
		.split('')
		.filter((ch) => CODE_ALPHABET.includes(ch))
		.join('');
}

/** "1 wine", "6 wines". */
export function plural(count: number, word: string): string {
	return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** "B7KQ4M" → "B7K·Q4M", as shown large on the host's screen. */
export function formatCode(code: string): string {
	return `${code.slice(0, 3)}·${code.slice(3)}`;
}

/** One taster's standing on one wine. `notsubmitted` only once the wine is revealed. */
export type EntryStatus = 'notstarted' | 'tasting' | 'submitted' | 'notsubmitted';

export function entryStatus(entry: { tastingId: string | null } | undefined, revealed: boolean): EntryStatus {
	if (entry?.tastingId) {
		return 'submitted';
	}
	if (revealed) {
		return 'notsubmitted';
	}
	return entry ? 'tasting' : 'notstarted';
}

/** Average of those who submitted, to one decimal; null when nobody did. */
export function average(scores: (number | null)[]): number | null {
	const given = scores.filter((score): score is number => score !== null);
	if (!given.length) {
		return null;
	}
	return Math.round((given.reduce((sum, score) => sum + score, 0) / given.length) * 10) / 10;
}

// ── Structure comparison ─────────────────────────────────────────────────────

/** The palate attributes compared, in grid order. Tannin only where a taster called the wine red. */
/** The stored 'Red' / 'White' as the lower-case kind the flight and progress views use. */
export const wineTypeOf = (value: string | null | undefined): 'red' | 'white' | null =>
	value === 'Red' ? 'red' : value === 'White' ? 'white' : null;

export function structureAttributes(wineTypes: ('red' | 'white')[], grid: Grid = 'cms'): string[] {
	const hasRed = wineTypes.includes('red');
	if (grid === 'wset') {
		return ['Acidity', ...(hasRed ? ['Tannin'] : []), 'Alcohol', 'Body', 'Flavour Intensity', 'Finish'];
	}
	return ['Acidity', 'Alcohol', ...(hasRed ? ['Tannin Volume'] : []), 'Body', 'Length of Finish'];
}

export type Agreement = 'agreed' | 'near' | 'split';

export type StructureAttribute = {
	name: string;
	levels: string[];
	/** Each taster's level as an index into `levels`. */
	calls: { personId: string; level: number }[];
	agreement: Agreement;
	/** "All three said Medium", "Two said Medium+, one said High", "Spread from Low to High". */
	phrase: string;
};

type PhraseWords = (typeof flightsText)['en']['results']['phrase'];

/** "All three said Medium" for `values`, indexes into `levels`; the words default to English. */
export function structurePhrase(
	levels: string[],
	values: number[],
	words: PhraseWords = flightsText.en.results.phrase,
) {
	const count = (n: number) => words.numbers[n] ?? String(n);
	const byLevel = new Map<number, number>();
	values.forEach((level) => byLevel.set(level, (byLevel.get(level) ?? 0) + 1));
	const groups = [...byLevel.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);

	if (groups.length === 1) {
		const level = levels[groups[0][0]];
		return values.length === 1
			? words.one(level)
			: values.length === 2
				? words.both(level)
				: words.all(count(values.length), level);
	}
	if (groups.every(([, n]) => n === 1)) {
		return words.spread(levels[Math.min(...values)], levels[Math.max(...values)]);
	}
	const phrase = groups.map(([level, n]) => words.said(count(n), n, levels[level])).join(words.joiner);
	return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/** Where each taster placed one attribute, and how far apart they were. Unscored: the label can't say. */
export function compareStructure(
	name: string,
	answers: { personId: string; wineType: 'red' | 'white'; palate: Record<string, string | string[]> | null }[],
	grid: Grid = 'cms',
): StructureAttribute | null {
	const options = grid === 'wset' ? WSET_PALATE : PALATE_OPTIONS;
	const levels = options.red[name] ?? options.white[name];
	if (!levels) {
		return null;
	}
	const calls = answers
		.map(({ personId, palate }) => {
			const answer = palate?.[name];
			return { personId, level: levels.indexOf(typeof answer === 'string' ? answer : '') };
		})
		.filter((call) => call.level >= 0);
	if (!calls.length) {
		return null;
	}

	const values = calls.map((call) => call.level);
	const spread = Math.max(...values) - Math.min(...values);
	const agreement: Agreement = spread === 0 ? 'agreed' : spread === 1 ? 'near' : 'split';

	const phrase = structurePhrase(levels, values);

	return { name, levels, calls, agreement, phrase };
}
