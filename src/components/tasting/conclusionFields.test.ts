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
			worldOrigin: 'Old World',
			climate: 'Cool',
			ageRange: '3-5 years',
			grapeVarieties: ['Pinot Noir'],
			possibleCountries: ['France'],
		};

		expect(icAnsweredCount(full)).toBe(IC_REQUIRED_COUNT);
	});

	it('does not count a cleared answer', () => {
		expect(icAnsweredCount({ worldOrigin: null, climate: 'Warm' })).toBe(1);
	});
});

describe('fcAnsweredCount', () => {
	it('counts each non-empty required field', () => {
		expect(fcAnsweredCount(undefined)).toBe(0);
		expect(fcAnsweredCount({ grapeVariety: 'Malbec', vintage: '' })).toBe(1);
	});

	it('reaches the full count when all five are answered', () => {
		const full = Object.fromEntries(FC_REQUIRED.map((key) => [key, 'x']));

		expect(fcAnsweredCount(full)).toBe(FC_REQUIRED.length);
	});

	it('ignores fields that are not part of the conclusion', () => {
		expect(fcAnsweredCount({ somethingElse: 'x' })).toBe(0);
	});
});
