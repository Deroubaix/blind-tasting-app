import { describe, expect, it } from 'vitest';
import { PT_TERMS, termIn } from './terms';
import { SIGHT_SCALES, SIGHT_YES_NO, sightFields } from '../components/sight/sightFields';
import { wineColors } from '../components/sight/sightData';
import { FRUIT_FAMILIES, NOSE_OPTIONS } from '../components/nose/noseFields';
import { BALANCE_NOTE, CONFIRM_ROWS, PALATE_OPTIONS, confirmOptions } from '../components/palate/palateFields';
import { AGE_RANGES, CLIMATES, QUALITY_LEVELS, STYLE_CATEGORIES } from '../components/tasting/conclusionFields';
import {
	AROMA_GROUPS,
	WSET_APPEARANCE,
	WSET_AROMA_CLUSTERS,
	WSET_COLOUR,
	WSET_FLAVOUR_KEY,
	WSET_NOSE_ASSESSMENTS,
	WSET_OBSERVATIONS,
	WSET_OBSERVATIONS_KEY,
	WSET_PALATE,
	WSET_QUALITY,
	WSET_READINESS,
} from '../components/wset/wsetFields';

const both = <T>(pick: (type: 'red' | 'white') => T[]) => [...pick('red'), ...pick('white')];
const entries = (record: Record<string, readonly string[]>) => Object.entries(record).flat(2);

// Official names, written the same in every language.
const KEPT = new Set([...QUALITY_LEVELS, ...STYLE_CATEGORIES].filter((term) => term !== 'Other'));

const GRID_TERMS = [
	...sightFields('red'),
	...entries(SIGHT_SCALES),
	...SIGHT_YES_NO,
	...both((t) => [...wineColors[t].primary, ...wineColors[t].secondary].map((c) => c.name)),
	...both((t) => entries(NOSE_OPTIONS[t])),
	...both((t) => FRUIT_FAMILIES[t]),
	...both((t) => entries(PALATE_OPTIONS[t])),
	BALANCE_NOTE,
	...CONFIRM_ROWS.flatMap((row) => [row, ...confirmOptions(row)]),
	...CLIMATES,
	...AGE_RANGES,
	...QUALITY_LEVELS,
	...STYLE_CATEGORIES,
	...entries(WSET_APPEARANCE),
	'Colour',
	...both((t) => WSET_COLOUR[t]),
	WSET_OBSERVATIONS_KEY,
	...WSET_OBSERVATIONS,
	...entries(WSET_NOSE_ASSESSMENTS),
	...both((t) => entries(WSET_PALATE[t])),
	WSET_FLAVOUR_KEY,
	...WSET_QUALITY,
	...WSET_READINESS,
	...AROMA_GROUPS,
	...WSET_AROMA_CLUSTERS.flatMap((cluster) => [cluster.name, ...cluster.terms]),
];

describe('Portuguese grid terms', () => {
	it('covers every question and answer on both grids', () => {
		const missing = [...new Set(GRID_TERMS)].filter((term) => !KEPT.has(term) && !(term in PT_TERMS));
		expect(missing).toEqual([]);
	});

	it('agrees with the question it answers', () => {
		expect(termIn('pt', 'Medium', 'Acidity')).toBe('Média');
		expect(termIn('pt', 'Medium', 'Body')).toBe('Médio');
		expect(termIn('pt', 'High', 'Tannin')).toBe('Altos');
		expect(termIn('pt', 'Light', 'Body')).toBe('Leve');
		expect(termIn('pt', 'Creamy', 'Mousse')).toBe('Cremosa');
	});

	it('leaves English, official names and unknown text alone', () => {
		expect(termIn('en', 'Medium', 'Body')).toBe('Medium');
		expect(termIn('pt', 'Premier Cru')).toBe('Premier Cru');
		expect(termIn('pt', 'my own note')).toBe('my own note');
		expect(termIn('pt', 'Confirm: Fruit')).toBe('Confirmação: Fruta');
	});
});
