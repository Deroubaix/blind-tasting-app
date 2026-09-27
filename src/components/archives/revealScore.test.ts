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

describe('the CMS core list', () => {
	const cab = { grapeVariety: 'Cabernet Sauvignon', countryOfOrigin: 'United States', vintage: '2019' };

	it('gives full credit for a region the list makes interchangeable for that grape', () => {
		const result = compareReveal(
			{ ...cab, regionAppellation: 'Sonoma County' },
			{ ...cab, regionAppellation: 'Napa Valley' },
		);
		expect(result.fields[2].status).toBe('correct');
		expect(result.fields[2].note).toContain('interchangeable');
		expect(result.score).toBe(4);
	});

	it('does not for a grape whose set does not hold both', () => {
		// Carneros and Napa are interchangeable for Chardonnay, not for Cabernet.
		const result = compareReveal(
			{ ...cab, regionAppellation: 'Carneros' },
			{ ...cab, regionAppellation: 'Napa Valley' },
		);
		expect(result.fields[2].status).toBe('close');
	});

	it('matches a region spelled either way', () => {
		const result = compareReveal(
			{ grapeVariety: 'Carménère', regionAppellation: 'Maipo' },
			{ grapeVariety: 'Carmenere', regionAppellation: 'Rapel' },
		);
		expect(result.fields[2].status).toBe('correct');
	});

	it('treats interchangeable quality levels alike', () => {
		const result = compareReveal(
			{ grapeVariety: 'Tempranillo', qualityLevel: 'Reserva' },
			{ grapeVariety: 'Tempranillo', qualityLevel: 'Gran Reserva' },
		);
		expect(result.fields[3].status).toBe('correct');
	});
});

describe('an "Other" quality level', () => {
	it('never scores when called', () => {
		const result = compareReveal({ qualityLevel: 'Other' }, { qualityLevel: 'Other', grapeVariety: 'X' });
		expect(result.fields[3].status).toBe('na');
		const called = compareReveal({ qualityLevel: 'Other' }, { qualityLevel: 'Crianza' });
		expect(called.fields[3].status).toBe('wrong');
	});

	it('drops out of the total when an older reveal saved it', () => {
		const result = compareReveal(
			{ qualityLevel: 'Reserva' },
			{ qualityLevel: 'Other', grapeVariety: 'Tempranillo' },
		);
		expect(result.fields[3].status).toBe('na');
		// Only the grape is left to score: the call left it blank.
		expect(result.outOf).toBe(1);
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
