import { describe, expect, it } from 'vitest';
import {
	type ProgressTasting,
	averageShare,
	bestRun,
	biasWord,
	confusions,
	homeHabits,
	signedSteps,
	median,
	palateBias,
	revealedFor,
	rollingAverage,
	toProgressTasting,
	trendOf,
	palateSamplesFor,
	type PalateSample,
} from './progressStats';

let n = 0;
const t = (score: number, extra: Partial<ProgressTasting> = {}): ProgressTasting => ({
	id: `t${++n}`,
	number: n,
	date: '2026-10-01',
	grid: 'cms',
	wineType: 'red',
	title: '',
	revealed: true,
	awaiting: false,
	score,
	outOf: 5,
	grape: null,
	country: null,
	...extra,
});

describe('toProgressTasting', () => {
	it('scores a revealed tasting and keeps the grape and country calls', () => {
		const p = toProgressTasting({
			id: 'a',
			number: 4,
			wineType: 'Red',
			conclusion: { final: { grapeVariety: 'Syrah', countryOfOrigin: 'France', vintage: '2019' } },
			reveal: { grapeVariety: 'Grenache', countryOfOrigin: 'France', vintage: '2019' },
		} as never);
		expect(p).toMatchObject({ revealed: true, score: 2, outOf: 3, wineType: 'red', grid: 'cms' });
		expect(p.grape).toEqual({ call: 'Syrah', actual: 'Grenache', wrong: true });
		expect(p.country?.wrong).toBe(false);
	});

	it('leaves an unrevealed tasting out of the scores', () => {
		const p = toProgressTasting({ id: 'b', wineType: 'White', wineName: 'Mystery' } as never);
		expect(p).toMatchObject({ revealed: false, score: 0, outOf: 0, title: 'Mystery', wineType: 'white' });
		expect(p.awaiting).toBe(true);
	});

	it('leaves a flight wine to its host, not the taster', () => {
		const p = toProgressTasting({ id: 'c', flight: { code: 'ABCDEF', wineNumber: 1 } } as never);
		expect(p).toMatchObject({ revealed: false, awaiting: false });
	});

	it('neither scores nor waits on a reveal with nothing this grid scores', () => {
		const p = toProgressTasting({ id: 'd', grid: 'cms', reveal: { readiness: 'Drink now' } } as never);
		expect(p).toMatchObject({ revealed: false, awaiting: false });
	});
});

describe('trend', () => {
	it('averages over a rolling window', () => {
		expect(rollingAverage([1, 0, 1, 0], 2)).toEqual([1, 0.5, 0.5, 0.5]);
	});

	it('needs three revealed tastings', () => {
		expect(trendOf([t(1), t(2)])).toBeNull();
	});

	it('compares the first full window with the latest', () => {
		const list = [t(1), t(1), t(1), t(1), t(1), t(5), t(5), t(5), t(5), t(5)];
		const trend = trendOf(list)!;
		expect(trend.direction).toBe('up');
		expect(trend.first).toBeCloseTo(0.2);
		expect(trend.last).toBeCloseTo(1);
	});

	it('reads a small change as level', () => {
		expect(trendOf([t(3), t(3), t(3), t(3)])!.direction).toBe('level');
	});

	it('splits a short list in half rather than comparing a window with itself', () => {
		const trend = trendOf([t(0), t(0), t(5), t(5), t(5)])!;
		expect(trend).toMatchObject({ direction: 'up', compared: 2, first: 0, last: 1 });
	});

	it('filters by grid and type, oldest first', () => {
		const list = [t(1, { number: 9 }), t(2, { number: 3, wineType: 'white' }), t(3, { number: 5, grid: 'wset' })];
		expect(revealedFor(list, 'cms', 'all').map((x) => x.number)).toEqual([3, 9]);
		expect(revealedFor(list, 'cms', 'white').map((x) => x.number)).toEqual([3]);
	});
});

describe('totals', () => {
	it('counts the best run at 60% or better', () => {
		expect(bestRun([t(3), t(4), t(2), t(3), t(5), t(4)])).toBe(3);
		expect(bestRun([])).toBe(0);
	});

	it('averages the share of fields right', () => {
		expect(averageShare([t(5), t(0, { outOf: 4 })])).toBeCloseTo(0.5);
		expect(averageShare([])).toBeNull();
	});
});

describe('confusions', () => {
	const grape = (call: string, actual: string) => ({ call, actual, wrong: call !== actual });

	it('lists wrong calls made at least twice, out of the times that wine was poured', () => {
		const list = [
			t(1, { grape: grape('Syrah', 'Grenache') }),
			t(1, { grape: grape('syrah ', 'Grenache') }),
			t(1, { grape: grape('Grenache', 'Grenache') }),
			t(1, { grape: grape('Merlot', 'Cabernet Franc') }),
		];
		expect(confusions(list, 'grape', 'all')).toEqual([{ call: 'Syrah', actual: 'Grenache', n: 2, of: 3 }]);
	});

	it('follows the wine-type filter and ignores unrevealed tastings', () => {
		const list = [
			t(1, { wineType: 'white', grape: grape('Chardonnay', 'Chenin Blanc') }),
			t(1, { wineType: 'white', grape: grape('Chardonnay', 'Chenin Blanc') }),
			t(1, { revealed: false, grape: grape('Syrah', 'Grenache') }),
		];
		expect(confusions(list, 'grape', 'red')).toEqual([]);
		expect(confusions(list, 'grape', 'white')).toHaveLength(1);
	});
});

describe('confusions across spellings', () => {
	it('counts accents and synonyms as the same wine, as scoring does', () => {
		const wrong = (call: string, actual: string) => t(1, { grape: { call, actual, wrong: true } });
		const right = t(5, { grape: { call: 'Grüner Veltliner', actual: 'Grüner Veltliner', wrong: false } });
		const pairs = confusions(
			[
				wrong('Syrah', 'Grüner Veltliner'),
				wrong('syrah', 'Gruner Veltliner'),
				wrong('Shiraz', 'Gruner veltliner'),
				right,
			],
			'grape',
			'all',
		);
		expect(pairs).toEqual([{ call: 'Syrah', actual: 'Grüner Veltliner', n: 3, of: 4 }]);
	});
});

describe('palate', () => {
	it('takes the median of an even group as the middle pair', () => {
		expect(median([1, 3, 2, 4])).toBe(2.5);
	});

	it('averages steps per attribute and words them', () => {
		const bias = palateBias(
			[
				{ attribute: 'Tannin', grid: 'cms', wineType: 'red', delta: 1 },
				{ attribute: 'Tannin', grid: 'cms', wineType: 'red', delta: 0 },
				{ attribute: 'Acidity', grid: 'cms', wineType: 'white', delta: -1 },
				{ attribute: 'Acidity', grid: 'wset', wineType: 'white', delta: 1 },
			],
			'cms',
			'all',
		);
		expect(bias).toEqual([
			{ attribute: 'Acidity', bias: -1, wines: 1 },
			{ attribute: 'Tannin', bias: 0.5, wines: 2 },
		]);
		expect(palateBias([{ attribute: 'Tannin', grid: 'cms', wineType: 'red', delta: 1 }], 'cms', 'white')).toEqual(
			[],
		);
		expect([biasWord(0.5), biasWord(-0.4), biasWord(0.2)]).toEqual(['high', 'low', 'inline']);
	});

	it('compares the user with the other tasters on each flight wine', () => {
		const palate = (acidity: string, tannin: string) => ({ Acidity: acidity, 'Tannin Volume': tannin });
		const samples = palateSamplesFor('me', [
			{
				grid: 'cms',
				answers: [
					{ personId: 'me', wineType: 'red', palate: palate('High', 'Medium+') },
					{ personId: 'a', wineType: 'red', palate: palate('Medium', 'Medium') },
					{ personId: 'b', wineType: 'red', palate: palate('Medium+', 'Medium') },
				],
			},
			// Alone on a wine: nothing to compare against.
			{ grid: 'cms', answers: [{ personId: 'me', wineType: 'red', palate: palate('Low', 'Low') }] },
		]);
		expect(samples).toEqual([
			{ attribute: 'Acidity', grid: 'cms', wineType: 'red', delta: 1.5 },
			{ attribute: 'Tannin', grid: 'cms', wineType: 'red', delta: 1 },
		]);
	});
});

describe('home habits', () => {
	const wrong = (call: string, actual: string) => ({ grape: { call, actual, wrong: true } });
	const right = (name: string) => ({ grape: { call: name, actual: name, wrong: false } });
	const acid = (delta: number): PalateSample => ({ attribute: 'Acidity', grid: 'cms', wineType: 'red', delta });

	it('waits for five revealed tastings', () => {
		const four = [t(2, wrong('Syrah', 'Grenache')), t(2, wrong('Syrah', 'Grenache')), t(3), t(4)];
		expect(homeHabits([...four, t(1, { revealed: false })], [acid(1), acid(1), acid(1)])).toBeNull();
		expect(homeHabits([...four, t(3)], [])).not.toBeNull();
	});

	it('names the most repeated wrong grape, out of the times it was poured', () => {
		const list = [
			t(2, wrong('Syrah', 'Grenache')),
			t(2, wrong('Syrah', 'Grenache')),
			t(3, right('Grenache')),
			t(2, wrong('Merlot', 'Malbec')),
			t(4),
		];
		expect(homeHabits(list, [])?.confusion).toEqual({ call: 'Syrah', actual: 'Grenache', n: 2, of: 3 });
	});

	it('only calls an attribute high or low with three flight wines behind it, and never when in line', () => {
		const five = [t(3), t(3), t(3), t(3), t(3)];
		expect(homeHabits(five, [acid(1), acid(1)])?.bias).toBeNull();
		expect(homeHabits(five, [acid(0.2), acid(0.2), acid(0.2)])?.bias).toBeNull();
		const bias = homeHabits(five, [acid(-1), acid(-0.5), acid(-0.6)])?.bias;
		expect(bias).toMatchObject({ attribute: 'Acidity', wines: 3 });
		expect(bias?.bias).toBeCloseTo(-0.7);
	});

	it('signs the steps and rounds by size', () => {
		expect([signedSteps(0.7, 'en'), signedSteps(-1.25, 'en'), signedSteps(0.04, 'en')]).toEqual([
			'+0.7',
			'−1.3',
			'0.0',
		]);
	});
});
