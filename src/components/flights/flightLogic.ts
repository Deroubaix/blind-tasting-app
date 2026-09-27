// Flight rules as plain data, shared by the API and the pages, and pinned by flightLogic.test.ts.

import { PALATE_OPTIONS } from '../palate/palateFields';

/** No 0/O or 1/I/L, so a code read across a table can't be misread. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;
export const MAX_WINES = 12;

export function newFlightCode(random: () => number = Math.random): string {
	return Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]).join(
		'',
	);
}

/** Uppercased, with spaces, dashes and the dot dropped: " b7k-q4m " → "B7KQ4M". */
export function normaliseCode(input: string): string {
	return input
		.toUpperCase()
		.split('')
		.filter((ch) => CODE_ALPHABET.includes(ch))
		.join('');
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
export function structureAttributes(wineTypes: ('red' | 'white')[]): string[] {
	const hasRed = wineTypes.includes('red');
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

const NUMBER_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const count = (n: number) => NUMBER_WORDS[n] ?? String(n);

/** Where each taster placed one attribute, and how far apart they were. Unscored: the label can't say. */
export function compareStructure(
	name: string,
	answers: { personId: string; wineType: 'red' | 'white'; palate: Record<string, string> | null }[],
): StructureAttribute | null {
	const levels = PALATE_OPTIONS.red[name] ?? PALATE_OPTIONS.white[name];
	if (!levels) {
		return null;
	}
	const calls = answers
		.map(({ personId, palate }) => ({ personId, level: levels.indexOf(palate?.[name] ?? '') }))
		.filter((call) => call.level >= 0);
	if (!calls.length) {
		return null;
	}

	const values = calls.map((call) => call.level);
	const spread = Math.max(...values) - Math.min(...values);
	const agreement: Agreement = spread === 0 ? 'agreed' : spread === 1 ? 'near' : 'split';

	const byLevel = new Map<number, number>();
	values.forEach((level) => byLevel.set(level, (byLevel.get(level) ?? 0) + 1));
	const groups = [...byLevel.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);

	let phrase: string;
	if (groups.length === 1) {
		const who = calls.length === 1 ? 'One' : calls.length === 2 ? 'Both' : `All ${count(calls.length)}`;
		phrase = `${who} said ${levels[groups[0][0]]}`;
	} else if (groups.every(([, n]) => n === 1)) {
		phrase = `Spread from ${levels[Math.min(...values)]} to ${levels[Math.max(...values)]}`;
	} else {
		phrase = groups.map(([level, n]) => `${count(n)} said ${levels[level]}`).join(', ');
		phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
	}

	return { name, levels, calls, agreement, phrase };
}
