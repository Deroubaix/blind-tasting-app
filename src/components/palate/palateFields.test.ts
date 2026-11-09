import { describe, expect, it } from 'vitest';
import { PALATE_GROUPS, PALATE_OPTIONS } from './palateFields';

describe('PALATE_GROUPS', () => {
	it.each(['red', 'white'] as const)('puts every %s palate question in exactly one group', (wineType) => {
		const grouped = PALATE_GROUPS.flatMap(([, keys]) => keys.filter((k) => k in PALATE_OPTIONS[wineType]));
		expect([...grouped].sort()).toEqual(Object.keys(PALATE_OPTIONS[wineType]).sort());
	});

	it('keeps grid order within the groups', () => {
		const order = PALATE_GROUPS.flatMap(([, keys]) => keys.filter((k) => k in PALATE_OPTIONS.red));
		expect(order).toEqual(Object.keys(PALATE_OPTIONS.red));
	});
});
