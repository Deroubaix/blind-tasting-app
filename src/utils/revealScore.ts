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

import { fold } from './autocompleteMatch';
import { WINE_REGION_GROUPS } from '../components/tasting/autocompleteData';
import { WSET_QUALITY, WSET_READINESS } from '../components/wset/wsetFields';
import { type Grid } from '../data/grids';
import { CORE_LIST, interchangeable } from '../components/archives/coreList';
import { archivesText } from '../i18n/archives';
import { DEFAULT_LANG, type Lang } from '../i18n';
import { COUNTRIES_PT, termIn } from '../i18n/terms';

export type Reveal = {
	/** The WSET answer key: the tutor's quality level and readiness. Absent on a CMS reveal. */
	qualityAssessment?: string | null;
	readiness?: string | null;
	grapeVariety?: string | null;
	countryOfOrigin?: string | null;
	regionAppellation?: string | null;
	qualityLevel?: string | null;
	styleCategory?: string | null;
	vintage?: string | null;
	/** Producer or cuvée. Not scored; titles the tasting once revealed. */
	wineName?: string | null;
};

export type RevealField =
	| 'qualityAssessment'
	| 'readiness'
	| 'grapeVariety'
	| 'countryOfOrigin'
	| 'regionAppellation'
	| 'qualityLevel'
	| 'styleCategory'
	| 'vintage';
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

type FieldDef = {
	key: RevealField;
	label: string;
	short: string;
	abbr: string;
	/** Few labels give it, so it's left off the scorecard when this one doesn't. */
	optional?: boolean;
};

export const REVEAL_FIELDS: FieldDef[] = [
	{ key: 'grapeVariety', label: 'Grape variety or blend', short: 'grape', abbr: 'Grape' },
	{ key: 'countryOfOrigin', label: 'Country of origin', short: 'country', abbr: 'Ctry' },
	{ key: 'regionAppellation', label: 'Region and appellation', short: 'region', abbr: 'Region' },
	{ key: 'qualityLevel', label: 'Official quality level', short: 'quality level', abbr: 'Qual' },
	{
		key: 'styleCategory',
		label: 'Official style category',
		short: 'style category',
		abbr: 'Style',
		optional: true,
	},
	{ key: 'vintage', label: 'Vintage', short: 'vintage', abbr: 'Vint' },
];

/**
 * The app scores a WSET tasting on quality and readiness only (the real paper marks the whole note,
 * reasons included); naming the wine is not asked at Level 3. The identity
 * fields are scored only when the answer key gives them, so a tutor who enters just the two
 * assessments scores the wine out of two.
 */
export const WSET_REVEAL_FIELDS: FieldDef[] = [
	{ key: 'qualityAssessment', label: 'Quality level', short: 'quality', abbr: 'Qual' },
	{ key: 'readiness', label: 'Readiness for drinking', short: 'readiness', abbr: 'Ready' },
	{ key: 'grapeVariety', label: 'Grape variety or blend', short: 'grape', abbr: 'Grape' },
	{ key: 'countryOfOrigin', label: 'Country of origin', short: 'country', abbr: 'Ctry' },
	{ key: 'regionAppellation', label: 'Region and appellation', short: 'region', abbr: 'Region' },
	{ key: 'vintage', label: 'Vintage', short: 'vintage', abbr: 'Vint' },
];

/** The fields a grid scores, labelled in `lang`; the exported lists above stay English. */
export function scoredFields(grid: Grid = 'cms', lang: Lang = DEFAULT_LANG): FieldDef[] {
	const fields = grid === 'wset' ? WSET_REVEAL_FIELDS : REVEAL_FIELDS;
	const words = archivesText[lang].score.fields;
	return lang === DEFAULT_LANG ? fields : fields.map((field) => ({ ...field, ...words[field.key] }));
}

type ScoreText = (typeof archivesText)[Lang]['score'];

/** Every field either grid scores: what "has a reveal" means regardless of grid. */
const ANY_SCORED_KEYS = [...new Set([...REVEAL_FIELDS, ...WSET_REVEAL_FIELDS].map((field) => field.key))];

const WSET_SCALES: Partial<Record<RevealField, string[]>> = {
	qualityAssessment: WSET_QUALITY,
	readiness: WSET_READINESS,
};

const clean = (value: string | null | undefined) => (value ?? '').trim() || null;

// Each name in a core-list synonym pair ("Syrah/Shiraz") stands for the whole pair, and so does a
// country named in Portuguese ("França" for France).
const SYNONYMS = new Map<string, string[]>();
const pairs = [
	...CORE_LIST.map(({ grape }) => grape.split('/')),
	...Object.entries(COUNTRIES_PT).filter(([en, pt]) => en !== pt),
];
for (const pair of pairs) {
	const names = pair.map(fold);
	if (names.length > 1) {
		names.forEach((name) => SYNONYMS.set(name, names));
	}
}

const nameSet = (value: string) =>
	new Set(
		value
			.split('/')
			.map(fold)
			.filter(Boolean)
			.flatMap((name) => SYNONYMS.get(name) ?? [name]),
	);

/**
 * Equal ignoring case and accents, or every slash-separated name in `call` is one of `actual`'s
 * (synonyms included). "Every", so listing several guesses can't score.
 */
export function sameName(call: string, actual: string): boolean {
	if (fold(call) === fold(actual)) {
		return true;
	}
	const called = nameSet(call);
	const given = nameSet(actual);
	return called.size > 0 && [...called].every((name) => given.has(name));
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
/** Picked from a grid list ending in "Other", which names nothing. */
const fromList = (key: RevealField) => key === 'qualityLevel' || key === 'styleCategory';

/** On the SAT's scales, one step off (Good for Very good, say) is close. */
function compareScale(key: RevealField, call: string, actual: string, t: ScoreText): [FieldStatus, string] | null {
	const scale = WSET_SCALES[key];
	if (!scale) {
		return null;
	}
	const index = (value: string) => scale.findIndex((step) => fold(step) === fold(value));
	const [a, b] = [index(call), index(actual)];
	if (a >= 0 && b >= 0 && Math.abs(a - b) === 1) {
		return ['close', a < b ? t.stepUnder : t.stepOver];
	}
	return ['wrong', ''];
}

function compareField(
	key: RevealField,
	call: string | null,
	actual: string | null,
	grape: string | null,
	t: ScoreText,
): [FieldStatus, string] {
	if (!actual) {
		return ['na', fromList(key) ? t.noneOnLabel : t.notInReveal];
	}
	if (fromList(key) && isOther(actual)) {
		return ['na', t.levelNotNamed];
	}
	if (!call) {
		return ['notcalled', t.leftBlankMiss];
	}
	if (fromList(key) && isOther(call)) {
		return ['wrong', t.otherNotLevel];
	}
	if (sameName(call, actual)) {
		return ['correct', ''];
	}
	const scaled = compareScale(key, call, actual, t);
	if (scaled) {
		return scaled;
	}
	if (key === 'regionAppellation' && interchangeable('regions', grape, call, actual)) {
		return ['correct', t.interchangeable(call)];
	}
	if (key === 'qualityLevel' && interchangeable('qualityLevels', grape, call, actual)) {
		return ['correct', t.interchangeable(call)];
	}
	if (key === 'vintage') {
		const gap = Math.abs(Number(call) - Number(actual));
		if (Number.isFinite(gap) && gap > 0 && gap <= 2) {
			return ['close', gap === 1 ? t.oneYearOff : t.twoYearsOff];
		}
	}
	if (key === 'regionAppellation' && regionsClose(call, actual)) {
		return ['close', t.regionClose];
	}
	return ['wrong', ''];
}

/** "grape", "grape and country", "grape, country and vintage"; the dictionary capitalises. */
function list(words: string[], and: string): string {
	return words.length <= 1 ? (words[0] ?? '') : `${words.slice(0, -1).join(', ')} ${and} ${words.at(-1)}`;
}

/** What every score against this label is out of: the scored fields it gives, as compareReveal counts them. */
export const revealOutOf = (reveal: Reveal, grid: Grid = 'cms') => compareReveal(null, reveal, null, grid).outOf;

export function compareReveal(
	call: Record<string, string | null | undefined> | undefined | null,
	reveal: Reveal,
	shortlist?: { grapeVarieties?: string[]; possibleCountries?: string[] } | null,
	grid: Grid = 'cms',
	lang: Lang = DEFAULT_LANG,
): Comparison {
	const t = archivesText[lang].score;
	const grape = clean(reveal.grapeVariety);
	const fields = scoredFields(grid, lang).flatMap(({ optional, ...field }) => {
		const called = clean(call?.[field.key]);
		const actual = clean(reveal[field.key]);
		const [status, note] = compareField(field.key, called, actual, grape, t);
		return optional && status === 'na' ? [] : [{ ...field, status, call: called, actual, note }];
	});

	const shorts = (status: FieldStatus) =>
		list(
			fields.filter((f) => f.status === status).map((f) => f.short),
			t.and,
		);
	const score = fields.filter((f) => f.status === 'correct').length;
	const outOf = fields.filter((f) => f.status !== 'na').length;

	const headline =
		outOf === 0
			? t.nothingToScore
			: score === outOf
				? t.allRight
				: score === 0
					? t.noneRight
					: t.right(shorts('correct'));

	const detailParts = [
		shorts('close') && t.close(shorts('close')),
		shorts('wrong') && t.wrong(shorts('wrong')),
		shorts('notcalled') && t.notCalled(shorts('notcalled')),
		shorts('na') && (grid === 'wset' ? t.notGiven : t.notOnLabel)(shorts('na')),
	].filter(Boolean);

	const onList = (list: string[] | undefined, actual: string | null) =>
		!list?.length || !actual ? null : list.some((item) => sameName(item, actual));

	return {
		fields,
		score,
		outOf,
		headline,
		detail: detailParts.length ? detailParts.join(' · ') : t.clean,
		shortlist: {
			grape: onList(shortlist?.grapeVarieties, clean(reveal.grapeVariety)),
			country: onList(shortlist?.possibleCountries, clean(reveal.countryOfOrigin)),
		},
	};
}

/**
 * The tasting's title once revealed: the wine name if given, else appellation, quality and vintage,
 * else the grape. A WSET answer key with no identity falls back to its quality call.
 */
export function revealTitle(reveal: Reveal, lang: Lang = DEFAULT_LANG): string {
	const t = archivesText[lang].score;
	const quality = clean(reveal.qualityAssessment);
	return (
		clean(reveal.wineName) ??
		([clean(reveal.regionAppellation), clean(reveal.qualityLevel), clean(reveal.vintage)]
			.filter(Boolean)
			.join(' ') ||
			clean(reveal.grapeVariety) ||
			(quality ? t.qualityWine(quality) : t.revealedWine))
	);
}

/**
 * The call in one line. On the CMS grid that is the wine named; on the WSET grid the quality and
 * readiness, with the identity after them when the taster ventured one.
 */
export function describeCall(
	call: Record<string, string | null | undefined> | null | undefined,
	grid: Grid,
	lang: Lang = DEFAULT_LANG,
): string {
	if (grid !== 'wset') {
		return describeWine(call, lang);
	}
	const assessment = [clean(call?.qualityAssessment), clean(call?.readiness)]
		.filter((value): value is string => Boolean(value))
		.map((value) => termIn(lang, value))
		.join(' · ');
	const identity = describeWine(call, lang);
	return [assessment, identity].filter(Boolean).join(' — ');
}

/** "Pinot Noir, Chambolle-Musigny, France — 2018" — the same shape as the call's subtitle. */
export function describeWine(
	wine: Reveal | Record<string, string | null | undefined> | null | undefined,
	lang: Lang = DEFAULT_LANG,
): string {
	if (!wine) {
		return '';
	}
	const country = clean(wine.countryOfOrigin);
	const parts = [clean(wine.grapeVariety), clean(wine.regionAppellation), country && termIn(lang, country)].filter(
		Boolean,
	);
	const vintage = clean(wine.vintage);
	return parts.length ? `${parts.join(', ')}${vintage ? ` — ${vintage}` : ''}` : (vintage ?? '');
}

/** True when the reveal has at least one field to score against, on either grid. */
export function isRevealed(reveal: Reveal | null | undefined): reveal is Reveal {
	return !!reveal && ANY_SCORED_KEYS.some((key) => clean(reveal[key]));
}
