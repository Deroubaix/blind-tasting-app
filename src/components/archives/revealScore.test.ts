import { describe, expect, it } from 'vitest';
import { compareReveal, describeWine, isRevealed, revealTitle, sameName } from './revealScore';

// The design's "near miss" sample: grape, country and quality right; village and vintage close.
const call = {
	grapeVariety: 'Pinot Noir',
	countryOfOrigin: 'France',
	regionAppellation: 'Gevrey-Chambertin',
	qualityLevel: 'Premier Cru',
	vintage: '2019',
};
const actual = {
	grapeVariety: 'Pinot Noir',
	countryOfOrigin: 'France',
	regionAppellation: 'Chambolle-Musigny',
	qualityLevel: 'Premier Cru',
	vintage: '2018',
};
const statuses = (c: ReturnType<typeof compareReveal>) => c.fields.map((f) => f.status);

describe('compareReveal', () => {
	it('scores exact matches and shows near misses as close, scoring nothing', () => {
		const result = compareReveal(call, actual);
		expect(statuses(result)).toEqual(['correct', 'correct', 'close', 'correct', 'close']);
		expect(result.score).toBe(3);
		expect(result.outOf).toBe(5);
		expect(result.headline).toBe('Grape, country and quality level right');
		expect(result.detail).toBe('Region and vintage close');
	});

	it('ignores case, accents and spacing', () => {
		const result = compareReveal({ grapeVariety: ' carmenere ' }, { grapeVariety: 'Carménère' });
		expect(result.fields[0].status).toBe('correct');
	});

	it('counts a blank call as a miss', () => {
		const result = compareReveal({ ...call, vintage: '' }, actual);
		expect(result.fields[4].status).toBe('notcalled');
		expect(result.outOf).toBe(5);
		expect(result.detail).toContain('Vintage not called');
	});

	it('leaves a field the label does not have out of the total', () => {
		const result = compareReveal(call, { ...actual, qualityLevel: '' });
		expect(result.fields[3].status).toBe('na');
		expect(result.outOf).toBe(4);
		expect(result.detail).toContain('Quality level not on the label');
	});

	it('calls a vintage within two years close, and three years wrong', () => {
		expect(compareReveal({ vintage: '2016' }, { vintage: '2018' }).fields[4]).toMatchObject({
			status: 'close',
			note: 'Two years off',
		});
		expect(compareReveal({ vintage: '2015' }, { vintage: '2018' }).fields[4].status).toBe('wrong');
	});

	it('calls the right region with a different appellation close, and another region wrong', () => {
		const region = (from: string, to: string) =>
			compareReveal({ regionAppellation: from }, { regionAppellation: to }).fields[2].status;
		expect(region('Burgundy', 'Chambolle-Musigny')).toBe('close');
		expect(region('Rioja', 'Rioja Alta')).toBe('close');
		expect(region('Barolo', 'Chambolle-Musigny')).toBe('wrong');
		// A catch-all group is not one region: Sicily is not close to Friuli.
		expect(region('Sicily', 'Friuli')).toBe('wrong');
	});

	it('treats a listed synonym as the same grape', () => {
		expect(sameName('Shiraz', 'Syrah/Shiraz')).toBe(true);
		expect(sameName('Grenache', 'Syrah/Shiraz')).toBe(false);
	});

	it('says so when everything is right, or nothing is', () => {
		expect(compareReveal(actual, actual).headline).toBe('Every field right');
		expect(compareReveal(actual, actual).detail).toBe('A clean call.');
		expect(compareReveal({}, actual).headline).toBe('No fields right');
	});

	it('checks whether the shortlist held the grape and country', () => {
		const result = compareReveal(call, actual, {
			grapeVarieties: ['Gamay', 'Pinot Noir'],
			possibleCountries: ['USA'],
		});
		expect(result.shortlist).toEqual({ grape: true, country: false });
		expect(compareReveal(call, actual, null).shortlist).toEqual({ grape: null, country: null });
	});
});

describe('revealTitle and describeWine', () => {
	it('titles by wine name, else appellation, quality and vintage', () => {
		expect(revealTitle({ ...actual, wineName: 'Papafigos' })).toBe('Papafigos');
		expect(revealTitle(actual)).toBe('Chambolle-Musigny Premier Cru 2018');
	});

	it('describes a wine like the call subtitle', () => {
		expect(describeWine(actual)).toBe('Pinot Noir, Chambolle-Musigny, France — 2018');
	});
});

describe('isRevealed', () => {
	it('needs at least one scored field', () => {
		expect(isRevealed(null)).toBe(false);
		expect(isRevealed({ wineName: 'Just a name' })).toBe(false);
		expect(isRevealed({ vintage: '2018' })).toBe(true);
	});
});
