import { describe, expect, it } from 'vitest';
import {
	WSET_AROMA_CLUSTERS,
	WSET_COLOUR,
	WSET_COLOUR_HEX,
	WSET_PALATE,
	WSET_QUALITY,
	WSET_READINESS,
	aromaClusters,
} from './wsetFields';

// Pins the WSET mode to the Level 3 Systematic Approach to Tasting Wine.

describe('appearance', () => {
	it('names the SAT colours, each with a tint', () => {
		expect(WSET_COLOUR.white).toEqual(['Lemon-green', 'Lemon', 'Gold', 'Amber', 'Brown']);
		expect(WSET_COLOUR.red).toEqual(['Purple', 'Ruby', 'Garnet', 'Tawny', 'Brown']);
		for (const colour of [...WSET_COLOUR.white, ...WSET_COLOUR.red]) {
			expect(WSET_COLOUR_HEX[colour]).toMatch(/^#[0-9a-f]{6}$/);
		}
	});
});

describe('nose', () => {
	it('offers the fruit clusters of one colour only, everything else to both', () => {
		const white = aromaClusters('white').map((c) => c.name);
		const red = aromaClusters('red').map((c) => c.name);
		expect(white).toEqual(expect.arrayContaining(['Green Fruit', 'Citrus Fruit', 'Stone Fruit', 'Tropical Fruit']));
		expect(white).not.toContain('Red Fruit');
		expect(red).toEqual(expect.arrayContaining(['Red Fruit', 'Black Fruit']));
		expect(red).not.toContain('Citrus Fruit');
		for (const shared of ['Floral', 'Herbaceous', 'Oak', 'Yeast', 'Deliberate Oxidation', 'Bottle Age']) {
			expect(white).toContain(shared);
			expect(red).toContain(shared);
		}
	});

	it('gives each colour one cluster per name, so the stored key is unambiguous', () => {
		for (const wineType of ['red', 'white'] as const) {
			const names = aromaClusters(wineType).map((c) => c.name);
			expect(new Set(names).size).toBe(names.length);
		}
	});

	it('lists no term twice within a cluster', () => {
		for (const cluster of WSET_AROMA_CLUSTERS) {
			expect(new Set(cluster.terms).size).toBe(cluster.terms.length);
		}
	});
});

describe('palate', () => {
	it('asks tannin of reds only, in SAT order', () => {
		expect(Object.keys(WSET_PALATE.red)).toEqual([
			'Sweetness',
			'Acidity',
			'Tannin',
			'Alcohol',
			'Body',
			'Mousse',
			'Flavour Intensity',
			'Finish',
		]);
		expect(Object.keys(WSET_PALATE.white)).not.toContain('Tannin');
		expect(WSET_PALATE.white.Mousse).toEqual(['Delicate', 'Creamy', 'Aggressive']);
	});

	it('uses the SAT five-point scales', () => {
		expect(WSET_PALATE.red.Acidity).toEqual(['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High']);
		expect(WSET_PALATE.red.Alcohol).toEqual(['Low', 'Medium', 'High']);
	});
});

describe('conclusions', () => {
	it('runs quality from faulty to outstanding and readiness from too young to too old', () => {
		expect(WSET_QUALITY).toEqual(['Faulty', 'Poor', 'Acceptable', 'Good', 'Very good', 'Outstanding']);
		expect(WSET_READINESS[0]).toBe('Too young');
		expect(WSET_READINESS.at(-1)).toBe('Too old');
		expect(WSET_READINESS).toHaveLength(4);
	});
});
