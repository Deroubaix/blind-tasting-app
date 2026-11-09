import { describe, expect, it } from 'vitest';
import {
	compareReveal,
	describeCall,
	describeWine,
	isRevealed,
	revealOutOf,
	revealTitle,
	sameName,
} from './revealScore';

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
		expect(sameName('Syrah/Shiraz', 'Shiraz')).toBe(true);
		expect(sameName('Primitivo', 'Zinfandel')).toBe(true);
		const shiraz = compareReveal({ grapeVariety: 'Shiraz' }, { grapeVariety: 'Syrah' });
		expect(shiraz.fields.find((f) => f.key === 'grapeVariety')?.status).toBe('correct');
		expect(sameName('Grenache/Syrah', 'Grenache/Syrah/Mourvèdre')).toBe(true);
	});

	it("doesn't score a call that lists several guesses", () => {
		expect(sameName('Pinot Noir/Syrah/Merlot/Nebbiolo', 'Syrah')).toBe(false);
		expect(sameName('France/Italy/USA', 'France')).toBe(false);
		expect(sameName('Syrah/Pinot Noir', 'Syrah/Shiraz')).toBe(false);
		expect(sameName('/', 'Syrah')).toBe(false);
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

describe('the WSET grid', () => {
	const key = { qualityAssessment: 'Very good', readiness: 'Can drink now, but has potential for ageing' };

	it('scores quality and readiness, out of two when the key names nothing else', () => {
		const result = compareReveal({ ...key }, key, null, 'wset');
		expect(result.fields.map((f) => f.key)).toEqual([
			'qualityAssessment',
			'readiness',
			'grapeVariety',
			'countryOfOrigin',
			'regionAppellation',
			'vintage',
		]);
		expect(result.score).toBe(2);
		expect(result.outOf).toBe(2);
		expect(result.headline).toBe('Every field right');
		expect(result.detail).toBe('Grape, country, region and vintage not given');
	});

	it('calls one step along the scale close, and two steps wrong', () => {
		const one = compareReveal({ ...key, qualityAssessment: 'Good' }, key, null, 'wset');
		expect(one.fields[0]).toMatchObject({ status: 'close', note: 'One step under' });
		expect(one.score).toBe(1);
		const two = compareReveal({ ...key, qualityAssessment: 'Acceptable' }, key, null, 'wset');
		expect(two.fields[0].status).toBe('wrong');
		const over = compareReveal({ ...key, readiness: 'Too old' }, key, null, 'wset');
		expect(over.fields[1].status).toBe('wrong');
	});

	it('scores the identity too when the key gives it', () => {
		const full = { ...key, grapeVariety: 'Riesling', countryOfOrigin: 'Germany', vintage: '2019' };
		const result = compareReveal({ ...key, grapeVariety: 'Riesling', vintage: '2018' }, full, null, 'wset');
		expect(result.outOf).toBe(5);
		expect(result.score).toBe(3);
		expect(result.detail).toBe('Vintage close · Country not called · Region not given');
	});

	it('counts an answer key of just the assessments as a reveal', () => {
		expect(isRevealed(key)).toBe(true);
		expect(revealTitle(key)).toBe('Very good wine');
		expect(revealTitle(key, 'pt')).toBe('Vinho muito bom');
		expect(revealTitle({ ...key, grapeVariety: 'Riesling' })).toBe('Riesling');
	});

	it('describes a call by its assessments, then any identity', () => {
		expect(describeCall(key, 'wset')).toBe('Very good · Can drink now, but has potential for ageing');
		expect(describeCall({ ...key, grapeVariety: 'Riesling', vintage: '2019' }, 'wset')).toBe(
			'Very good · Can drink now, but has potential for ageing — Riesling — 2019',
		);
		expect(describeCall({ grapeVariety: 'Riesling' }, 'cms')).toBe('Riesling');
	});
});

describe('countries named in Portuguese', () => {
	it('score the same as the English name', () => {
		expect(sameName('França', 'France')).toBe(true);
		expect(sameName('estados unidos', 'United States')).toBe(true);
		expect(sameName('França', 'Italy')).toBe(false);
	});

	it("show in the reader's language in the one-line summary", () => {
		const wine = { grapeVariety: 'Chenin Blanc', countryOfOrigin: 'France', vintage: '2020' };
		expect(describeWine(wine, 'pt')).toBe('Chenin Blanc, França — 2020');
		expect(describeWine(wine)).toBe('Chenin Blanc, France — 2020');
	});
});

describe('style category', () => {
	const vouvray = { grapeVariety: 'Chenin Blanc', regionAppellation: 'Vouvray', styleCategory: 'Demi-Sec' };
	const status = (c: Record<string, string>, r: Record<string, string>) =>
		compareReveal(c, r).fields.find((f) => f.key === 'styleCategory')?.status;

	it('scores the style when the label gives one', () => {
		expect(status({ styleCategory: 'Demi-Sec' }, vouvray)).toBe('correct');
		expect(status({ styleCategory: 'Sec' }, vouvray)).toBe('wrong');
		expect(status({}, vouvray)).toBe('notcalled');
		expect(status({ styleCategory: 'Other' }, vouvray)).toBe('wrong');
		expect(revealOutOf(vouvray)).toBe(3);
	});

	it('leaves it off the card when the label has none', () => {
		expect(status({ styleCategory: 'Sec' }, { grapeVariety: 'Chenin Blanc' })).toBeUndefined();
		expect(status({}, { grapeVariety: 'Chenin Blanc', styleCategory: 'Other' })).toBeUndefined();
		expect(compareReveal(call, actual).outOf).toBe(revealOutOf(actual));
		expect(compareReveal(call, actual).fields.map((f) => f.key)).not.toContain('styleCategory');
	});

	it('is not asked on the WSET grid', () => {
		expect(revealOutOf({ qualityAssessment: 'Good', styleCategory: 'Sec' }, 'wset')).toBe(1);
	});
});

describe('revealOutOf', () => {
	it('matches what each score is out of, an unnamed quality level included', () => {
		const other = { ...actual, qualityLevel: 'Other' };
		expect(revealOutOf(other)).toBe(compareReveal(call, other).outOf);
		expect(revealOutOf(other)).toBe(revealOutOf(actual) - 1);
		expect(revealOutOf({ grapeVariety: 'Syrah', vintage: ' ' })).toBe(1);
	});
});
