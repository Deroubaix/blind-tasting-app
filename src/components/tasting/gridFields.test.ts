import { describe, expect, it } from 'vitest';
import { SIGHT_SCALES, sightFields } from '../sight/sightFields';
import { wineColors } from '../sight/sightData';
import { NOSE_ASSESSMENTS, NOSE_OPTIONS } from '../nose/noseFields';
import { PALATE_OPTIONS, palateRequired } from '../palate/palateFields';
import { AGE_RANGES, QUALITY_LEVELS } from './conclusionFields';
import { GRAPE_VARIETALS } from './autocompleteData';

// Pins the app to the 2024 CMS Americas deductive tasting grid.

describe('sight', () => {
	it('asks rim variation and staining of reds only', () => {
		expect(sightFields('red')).toEqual(expect.arrayContaining(['Rim Variation', 'Staining']));
		expect(sightFields('white')).not.toContain('Rim Variation');
		expect(sightFields('white')).not.toContain('Staining');
	});

	it('uses the grid scales', () => {
		expect(SIGHT_SCALES.Clarity).toEqual(['Clear', 'Hazy', 'Cloudy']);
		expect(SIGHT_SCALES['Intensity of Color']).toHaveLength(7);
	});

	it('uses the grid colour terms', () => {
		expect(wineColors.red.secondary.map((c) => c.name)).toEqual([
			'Blue',
			'Magenta',
			'Ruby',
			'Orange',
			'Garnet',
			'Brown',
		]);
		expect(wineColors.white.primary.map((c) => c.name)).toEqual(['Water White', 'Straw', 'Yellow', 'Gold']);
	});
});

describe('nose', () => {
	it('has the grid age stages, including Developing', () => {
		expect(NOSE_OPTIONS.red['Age Assessment']).toEqual(['Youthful', 'Developing', 'Vinous']);
	});

	it('has the grid oak questions, each with one answer', () => {
		for (const key of ['New Oak', 'Oak Intensity', 'Oak Type']) {
			expect(NOSE_ASSESSMENTS.has(key)).toBe(true);
		}
		expect(NOSE_OPTIONS.white['Oak Type']).toEqual(['French', 'American', 'Eastern European']);
	});

	it('lists no descriptor twice within a heading', () => {
		for (const options of [NOSE_OPTIONS.red, NOSE_OPTIONS.white]) {
			for (const values of Object.values(options)) {
				expect(new Set(values).size).toBe(values.length);
			}
		}
	});
});

describe('palate', () => {
	it('requires tannin for reds and phenolic bitterness for whites', () => {
		expect(palateRequired('red')).toContain('Tannin');
		expect(palateRequired('red')).not.toContain('Phenolic Bitterness');
		expect(palateRequired('white')).toContain('Phenolic Bitterness');
		expect(palateRequired('white')).not.toContain('Tannin');
	});

	it('only requires attributes the page actually offers', () => {
		for (const type of ['red', 'white'] as const) {
			for (const key of palateRequired(type)) {
				expect(PALATE_OPTIONS[type]).toHaveProperty([key]);
			}
		}
	});

	it('has the full seven-step sweetness scale and Balance', () => {
		expect(PALATE_OPTIONS.red.Sweetness).toHaveLength(7);
		expect(PALATE_OPTIONS.white).toHaveProperty('Balance');
	});
});

describe('conclusions', () => {
	it('uses the grid age ranges and quality levels', () => {
		expect(AGE_RANGES).toEqual(['1-3 years', '3-5 years', '5-10 years', '10 years+']);
		expect(QUALITY_LEVELS).toEqual(expect.arrayContaining(['Reserva', 'Riserva', 'Kabinett', 'Gran Selezione']));
	});

	it('offers every Advanced Sommelier core grape', () => {
		expect(GRAPE_VARIETALS).toEqual(expect.arrayContaining(['Cabernet Franc', 'Carménère', 'Corvina']));
	});
});

describe('no old typos', () => {
	const everyOption = [
		...Object.values(SIGHT_SCALES).flat(),
		...Object.values(NOSE_OPTIONS.red).flat(),
		...Object.values(NOSE_OPTIONS.white).flat(),
		...Object.values(PALATE_OPTIONS.red).flat(),
		...Object.values(PALATE_OPTIONS.white).flat(),
	];

	it.each(['Slight Cloudy', 'Granit', 'Bellpepper', 'Day Bright', 'Slavonian'])('does not offer "%s"', (term) => {
		expect(everyOption).not.toContain(term);
	});
});
