// Scoring a call against the revealed wine. Plain data, no React, so the detail page, the
// archive cards and the tests all read one definition of "right".
//
// Rules (agreed with the design):
// - One point per field for an exact match. Case, accents and extra spaces don't matter, and a
//   listed synonym counts ("Syrah/Shiraz" matches either).
// - Interchangeable on the CMS core list also scores (coreList.ts).
// - "Other" never scores; on an older reveal it drops out of the total.
// - "Close" is shown but scores nothing: the vintage within two years, or the right region with a
//   different appellation.
// - A field left blank in the call is "not called", and counts as a miss.
// - A field the reveal leaves blank (no quality level on the label, say) is "not applicable" and
//   drops out of the total, so that wine is scored out of four.

import { fold } from '../tasting/autocompleteMatch';
import { WINE_REGION_GROUPS } from '../tasting/autocompleteData';
import { interchangeable } from './coreList';

export type Reveal = {
	grapeVariety?: string | null;
	countryOfOrigin?: string | null;
	regionAppellation?: string | null;
	qualityLevel?: string | null;
	vintage?: string | null;
	/** Producer or cuvée. Not scored; titles the tasting once revealed. */
	wineName?: string | null;
};

export type RevealField = 'grapeVariety' | 'countryOfOrigin' | 'regionAppellation' | 'qualityLevel' | 'vintage';
export type FieldStatus = 'correct' | 'close' | 'wrong' | 'notcalled' | 'na';

export type ComparedField = {
	key: RevealField;
	label: string;
	/** For sentences: "grape", "quality level". */
	short: string;
	/** For the five-segment strip. */
	abbr: string;
	status: FieldStatus;
	call: string | null;
	actual: string | null;
	note: string;
};

export type Comparison = {
	fields: ComparedField[];
	score: number;
	outOf: number;
	/** "Grape, country and quality level right" */
	headline: string;
	/** "Region and vintage close · …", or "A clean call." */
	detail: string;
	/** Whether the initial-conclusion shortlist held the right grape and country; null when not shortlisted. */
	shortlist: { grape: boolean | null; country: boolean | null };
};

export const REVEAL_FIELDS: { key: RevealField; label: string; short: string; abbr: string }[] = [
	{ key: 'grapeVariety', label: 'Grape variety or blend', short: 'grape', abbr: 'Grape' },
	{ key: 'countryOfOrigin', label: 'Country of origin', short: 'country', abbr: 'Ctry' },
	{ key: 'regionAppellation', label: 'Region and appellation', short: 'region', abbr: 'Region' },
	{ key: 'qualityLevel', label: 'Official quality level', short: 'quality level', abbr: 'Qual' },
	{ key: 'vintage', label: 'Vintage', short: 'vintage', abbr: 'Vint' },
];

const clean = (value: string | null | undefined) => (value ?? '').trim() || null;

/** Equal ignoring case and accents, or sharing one of the slash-separated names. */
export function sameName(a: string, b: string): boolean {
	if (fold(a) === fold(b)) {
		return true;
	}
	const names = (value: string) => value.split('/').map(fold).filter(Boolean);
	const other = new Set(names(b));
	return names(a).some((name) => other.has(name));
}

const regionGroup = new Map<string, string>();
for (const group of WINE_REGION_GROUPS) {
	if (group.closeTogether) {
		for (const region of group.regions) {
			regionGroup.set(fold(region), group.name);
		}
	}
}

/** Right region, different appellation: the same close-together group, or one name inside the other. */
function regionsClose(call: string, actual: string): boolean {
	const [a, b] = [fold(call), fold(actual)];
	if (a.includes(b) || b.includes(a)) {
		return true;
	}
	const group = regionGroup.get(a);
	return group !== undefined && group === regionGroup.get(b);
}

const isOther = (value: string) => fold(value) === 'other';

function compareField(
	key: RevealField,
	call: string | null,
	actual: string | null,
	grape: string | null,
): [FieldStatus, string] {
	if (!actual) {
		return ['na', key === 'qualityLevel' ? 'None on the label' : 'Not given in the reveal'];
	}
	if (key === 'qualityLevel' && isOther(actual)) {
		return ['na', 'The level on the label was not named'];
	}
	if (!call) {
		return ['notcalled', 'Left blank, so it counts as a miss'];
	}
	if (key === 'qualityLevel' && isOther(call)) {
		return ['wrong', '“Other” does not name a level'];
	}
	if (sameName(call, actual)) {
		return ['correct', ''];
	}
	if (key === 'regionAppellation' && interchangeable('regions', grape, call, actual)) {
		return ['correct', `You called ${call} — interchangeable on the CMS core list`];
	}
	if (key === 'qualityLevel' && interchangeable('qualityLevels', grape, call, actual)) {
		return ['correct', `You called ${call} — interchangeable on the CMS core list`];
	}
	if (key === 'vintage') {
		const gap = Math.abs(Number(call) - Number(actual));
		if (Number.isFinite(gap) && gap > 0 && gap <= 2) {
			return ['close', gap === 1 ? 'One year off' : 'Two years off'];
		}
	}
	if (key === 'regionAppellation' && regionsClose(call, actual)) {
		return ['close', 'Right region, different appellation'];
	}
	return ['wrong', ''];
}

/** "grape", "grape and country", "grape, country and vintage" — capitalised. */
function sentence(words: string[]): string {
	const text = words.length <= 1 ? (words[0] ?? '') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`;
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function compareReveal(
	call: Record<string, string | null | undefined> | undefined | null,
	reveal: Reveal,
	shortlist?: { grapeVarieties?: string[]; possibleCountries?: string[] } | null,
): Comparison {
	const grape = clean(reveal.grapeVariety);
	const fields = REVEAL_FIELDS.map((field) => {
		const called = clean(call?.[field.key]);
		const actual = clean(reveal[field.key]);
		const [status, note] = compareField(field.key, called, actual, grape);
		return { ...field, status, call: called, actual, note };
	});

	const shorts = (status: FieldStatus) => fields.filter((f) => f.status === status).map((f) => f.short);
	const score = fields.filter((f) => f.status === 'correct').length;
	const outOf = fields.filter((f) => f.status !== 'na').length;

	const headline =
		outOf === 0
			? 'Nothing to score yet'
			: score === outOf
				? 'Every field right'
				: score === 0
					? 'No fields right'
					: `${sentence(shorts('correct'))} right`;

	const detailParts = [
		shorts('close').length ? `${sentence(shorts('close'))} close` : '',
		shorts('wrong').length ? `${sentence(shorts('wrong'))} wrong` : '',
		shorts('notcalled').length ? `${sentence(shorts('notcalled'))} not called` : '',
		shorts('na').length ? `${sentence(shorts('na'))} not on the label` : '',
	].filter(Boolean);

	const onList = (list: string[] | undefined, actual: string | null) =>
		!list?.length || !actual ? null : list.some((item) => sameName(item, actual));

	return {
		fields,
		score,
		outOf,
		headline,
		detail: detailParts.length ? detailParts.join(' · ') : 'A clean call.',
		shortlist: {
			grape: onList(shortlist?.grapeVarieties, clean(reveal.grapeVariety)),
			country: onList(shortlist?.possibleCountries, clean(reveal.countryOfOrigin)),
		},
	};
}

/** The tasting's title once revealed: the wine name if given, else appellation, quality and vintage. */
export function revealTitle(reveal: Reveal): string {
	return (
		clean(reveal.wineName) ??
		([clean(reveal.regionAppellation), clean(reveal.qualityLevel), clean(reveal.vintage)]
			.filter(Boolean)
			.join(' ') ||
			clean(reveal.grapeVariety) ||
			'Revealed wine')
	);
}

/** "Pinot Noir, Chambolle-Musigny, France — 2018" — the same shape as the call's subtitle. */
export function describeWine(wine: Reveal | Record<string, string | null | undefined> | null | undefined): string {
	if (!wine) {
		return '';
	}
	const parts = [wine.grapeVariety, wine.regionAppellation, wine.countryOfOrigin].map(clean).filter(Boolean);
	const vintage = clean(wine.vintage);
	return parts.length ? `${parts.join(', ')}${vintage ? ` — ${vintage}` : ''}` : (vintage ?? '');
}

/** True when the reveal has at least one field to score against. */
export function isRevealed(reveal: Reveal | null | undefined): reveal is Reveal {
	return !!reveal && REVEAL_FIELDS.some((field) => clean(reveal[field.key]));
}
