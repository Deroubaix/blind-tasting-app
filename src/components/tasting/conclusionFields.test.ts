import { describe, expect, it } from 'vitest';
import { FC_REQUIRED, IC_REQUIRED_COUNT, fcAnsweredCount, icAnsweredCount } from './conclusionFields';

describe('icAnsweredCount', () => {
	it('counts nothing for an untouched conclusion', () => {
		expect(icAnsweredCount(undefined)).toBe(0);
		expect(icAnsweredCount({})).toBe(0);
	});

	it('counts the list fields only when they have an entry', () => {
		expect(icAnsweredCount({ grapeVarieties: [], possibleCountries: [] })).toBe(0);
		expect(icAnsweredCount({ grapeVarieties: ['Merlot'], possibleCountries: ['France'] })).toBe(2);
	});

	it('reaches the required count when every field is answered', () => {
		const full = {
			climate: 'Cool',
			ageRange: '3-5 years',
			grapeVarieties: ['Pinot Noir'],
			possibleCountries: ['France'],
		};

		expect(icAnsweredCount(full)).toBe(IC_REQUIRED_COUNT);
	});

	it('does not count a cleared answer', () => {
		expect(icAnsweredCount({ climate: null, ageRange: '1-3 years' })).toBe(1);
	});

	it('ignores Old/New World, which the 2024 grid dropped', () => {
		expect(icAnsweredCount({ worldOrigin: 'Old World' })).toBe(0);
	});
});

describe('fcAnsweredCount', () => {
	it('counts each non-empty required field', () => {
		expect(fcAnsweredCount(undefined)).toBe(0);
		expect(fcAnsweredCount({ grapeVariety: 'Malbec', vintage: '' })).toBe(1);
	});

	it('reaches the full count when grape, country, region and vintage are answered', () => {
		const full = Object.fromEntries(FC_REQUIRED.map((key) => [key, 'x']));

		expect(fcAnsweredCount(full)).toBe(FC_REQUIRED.length);
	});

	it('does not require quality level or style, which are "where appropriate"', () => {
		expect(fcAnsweredCount({ qualityLevel: 'Grand Cru', styleCategory: 'Sec' })).toBe(0);
	});

	it('ignores fields that are not part of the conclusion', () => {
		expect(fcAnsweredCount({ somethingElse: 'x' })).toBe(0);
	});
});
