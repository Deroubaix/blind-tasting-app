// The Progress page's figures, as pure functions of the saved tastings, pinned by progressStats.test.ts.

import { compareReveal, isRevealed, revealTitle, sameName } from '../archives/revealScore';
import { type Grid, gridOf } from '../../data/grids';
import { DEFAULT_LANG, type Lang } from '../../i18n';
import { type TastingData } from '../../types/TastingData';
import { compareStructure, structureAttributes, wineTypeOf } from '../flights/flightLogic';

export type WineType = 'red' | 'white';
export type TypeFilter = 'all' | WineType;

/** One wrong-or-right call on a scored field, kept for the confusion pairs. */
export type Call = { call: string | null; actual: string | null; wrong: boolean };

export type ProgressTasting = {
	id: string;
	number: number;
	date: string;
	grid: Grid;
	wineType: WineType | null;
	title: string;
	revealed: boolean;
	score: number;
	outOf: number;
	grape: Call | null;
	country: Call | null;
};

/** A share of scored fields right at or above this counts toward a run: 3 / 5 on CMS. */
export const RUN_THRESHOLD = 0.6;
/** Revealed tastings needed before a trend is drawn. */
export const MIN_FOR_TREND = 3;
/** How many tastings the rolling average covers. */
export const ROLLING_WINDOW = 5;
/** A change in share smaller than this reads as level. */
const LEVEL_BAND = 0.03;
/** Bias at or beyond this many scale steps reads as running high or low. */
export const BIAS_THRESHOLD = 0.4;

type Saved = TastingData & { id: string; number?: number; created_at?: string };

export function toProgressTasting(tasting: Saved, lang: Lang = DEFAULT_LANG): ProgressTasting {
	const grid = gridOf(tasting.grid);
	const revealed = isRevealed(tasting.reveal);
	const result = revealed
		? compareReveal(tasting.conclusion?.final, tasting.reveal!, tasting.conclusion?.initial, grid, lang)
		: null;
	const field = (key: 'grapeVariety' | 'countryOfOrigin'): Call | null => {
		const found = result?.fields.find((f) => f.key === key);
		return found && found.status !== 'na'
			? { call: found.call, actual: found.actual, wrong: found.status === 'wrong' }
			: null;
	};
	return {
		id: tasting.id,
		number: tasting.number ?? 0,
		date: tasting.created_at ?? '',
		grid,
		wineType: wineTypeOf(tasting.wineType),
		title: revealed ? revealTitle(tasting.reveal!, lang) : tasting.wineName || '',
		revealed: !!result && result.outOf > 0,
		score: result?.score ?? 0,
		outOf: result?.outOf ?? 0,
		grape: field('grapeVariety'),
		country: field('countryOfOrigin'),
	};
}

export const matchesType = (t: ProgressTasting, type: TypeFilter) => type === 'all' || t.wineType === type;

/** Revealed tastings on one grid and type, oldest first by tasting number. */
export function revealedFor(list: ProgressTasting[], grid: Grid, type: TypeFilter): ProgressTasting[] {
	return list
		.filter((t) => t.revealed && t.grid === grid && matchesType(t, type))
		.sort((a, b) => a.number - b.number);
}

export const share = (t: ProgressTasting) => (t.outOf ? t.score / t.outOf : 0);

export function rollingAverage(shares: number[], window = ROLLING_WINDOW): number[] {
	return shares.map((_, i) => {
		const slice = shares.slice(Math.max(0, i - window + 1), i + 1);
		return slice.reduce((a, b) => a + b, 0) / slice.length;
	});
}

export type Trend = {
	direction: 'up' | 'down' | 'level';
	first: number;
	last: number;
	/** How many tastings at each end are compared: the window, or half the list when it is shorter. */
	compared: number;
	rolling: number[];
};

const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

/** The first tastings against the latest, never overlapping; null below the minimum. */
export function trendOf(revealed: ProgressTasting[], window = ROLLING_WINDOW): Trend | null {
	if (revealed.length < MIN_FOR_TREND) {
		return null;
	}
	const shares = revealed.map(share);
	const compared = Math.min(window, Math.floor(shares.length / 2));
	const first = mean(shares.slice(0, compared));
	const last = mean(shares.slice(-compared));
	const diff = last - first;
	return {
		direction: diff > LEVEL_BAND ? 'up' : diff < -LEVEL_BAND ? 'down' : 'level',
		first,
		last,
		compared,
		rolling: rollingAverage(shares, window),
	};
}

/** Most revealed tastings in a row at the run threshold or better. */
export function bestRun(revealed: ProgressTasting[]): number {
	let best = 0;
	let current = 0;
	for (const t of revealed) {
		current = share(t) >= RUN_THRESHOLD ? current + 1 : 0;
		best = Math.max(best, current);
	}
	return best;
}

export function averageShare(revealed: ProgressTasting[]): number | null {
	return revealed.length ? revealed.reduce((a, t) => a + share(t), 0) / revealed.length : null;
}

export type Confusion = { call: string; actual: string; n: number; of: number };

/**
 * Wrong calls made at least twice, counted out of the times that wine was poured. Names match as
 * scoring matches them (accents, case, "Syrah/Shiraz"), and both grids count: a grape is a grape.
 */
export function confusions(
	list: ProgressTasting[],
	field: 'grape' | 'country',
	type: TypeFilter,
	min = 2,
): Confusion[] {
	const poured: { name: string; n: number }[] = [];
	const pairs: Confusion[] = [];
	for (const t of list) {
		const scored = t.revealed && matchesType(t, type) ? t[field] : null;
		if (!scored?.actual) {
			continue;
		}
		const actual = scored.actual.trim();
		const wine = poured.find((p) => sameName(p.name, actual));
		if (wine) {
			wine.n += 1;
		} else {
			poured.push({ name: actual, n: 1 });
		}
		if (scored.wrong && scored.call) {
			const call = scored.call.trim();
			const pair = pairs.find((p) => sameName(p.call, call) && sameName(p.actual, actual));
			if (pair) {
				pair.n += 1;
			} else {
				pairs.push({ call, actual, n: 1, of: 0 });
			}
		}
	}
	return pairs
		.map((pair) => ({ ...pair, of: poured.find((p) => sameName(p.name, pair.actual))?.n ?? pair.n }))
		.filter((pair) => pair.n >= min)
		.sort((a, b) => b.n - a.n || b.n / b.of - a.n / a.of || a.call.localeCompare(b.call));
}

/** One revealed flight wine's call on one attribute, in scale steps against the group's median. */
export type PalateSample = { attribute: PalateAttribute; grid: Grid; wineType: WineType; delta: number };

export const PALATE_ATTRIBUTES = ['Acidity', 'Tannin', 'Alcohol', 'Body', 'Finish'] as const;
export type PalateAttribute = (typeof PALATE_ATTRIBUTES)[number];

export type PalateBias = { attribute: PalateAttribute; bias: number; wines: number };

export function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Mean step difference per attribute, in display order; attributes with no wines are left out. */
export function palateBias(samples: PalateSample[], grid: Grid, type: TypeFilter): PalateBias[] {
	return PALATE_ATTRIBUTES.map((attribute) => {
		const mine = samples.filter(
			(s) => s.attribute === attribute && s.grid === grid && (type === 'all' || s.wineType === type),
		);
		return {
			attribute,
			bias: mine.length ? mine.reduce((a, s) => a + s.delta, 0) / mine.length : 0,
			wines: mine.length,
		};
	}).filter((b) => b.wines > 0);
}

export const biasWord = (bias: number): 'high' | 'low' | 'inline' =>
	bias >= BIAS_THRESHOLD ? 'high' : bias <= -BIAS_THRESHOLD ? 'low' : 'inline';

/** The grid's own attribute names, mapped to the five the Progress page shows. */
const ATTRIBUTE: Record<string, PalateAttribute> = {
	Acidity: 'Acidity',
	Alcohol: 'Alcohol',
	Body: 'Body',
	Tannin: 'Tannin',
	'Tannin Volume': 'Tannin',
	Finish: 'Finish',
	'Length of Finish': 'Finish',
};

export type FlightWineCalls = {
	grid: Grid;
	answers: { personId: string; wineType: WineType; palate: Record<string, string | string[]> | null }[];
};

/** Each attribute of each flight wine the user tasted, as steps from the other tasters' median. */
export function palateSamplesFor(userId: string, wines: FlightWineCalls[]): PalateSample[] {
	const samples: PalateSample[] = [];
	for (const { grid, answers } of wines) {
		const mine = answers.find((a) => a.personId === userId);
		if (!mine || answers.length < 2) {
			continue;
		}
		for (const name of structureAttributes([mine.wineType], grid)) {
			const attribute = ATTRIBUTE[name];
			const compared = attribute ? compareStructure(name, answers, grid) : null;
			const my = compared?.calls.find((c) => c.personId === userId);
			const others = compared?.calls.filter((c) => c.personId !== userId).map((c) => c.level) ?? [];
			if (attribute && my && others.length) {
				samples.push({ attribute, grid, wineType: mine.wineType, delta: my.level - median(others) });
			}
		}
	}
	return samples;
}
