import { describe, expect, it } from 'vitest';
import { tastingCreateSchema } from './tasting';

// A full red tasting shaped exactly as the save page sends it: the tasting context spread out,
// including client-only fields the server should ignore.
const fullTasting = {
	wineType: 'Red',
	wineName: 'Flight 3, wine 2',
	timerEnabled: true,
	timerSeconds: 240,
	timerMode: 'exam',
	timerEndsAt: 1790000000000,
	soundEnabled: false,
	furthestPhase: 5,
	sight: { Clarity: 'Clear', 'Secondary Color(s)': ['Garnet', 'Orange'], 'Rim Variation': 'Yes' },
	nose: { 'Aromatic Intensity': ['Medium+'], 'Red Fruit': ['Cherry', 'Cranberry'] },
	palate: { Acidity: 'Medium+', Balance: 'Yes', 'Dominant Element(s)': 'Acid and tannin' },
	confirmNose: 'Fruit turned tart on the palate.',
	conclusion: {
		initial: {
			climate: 'Cool',
			ageRange: '3-5 years',
			grapeVarieties: ['Pinot Noir'],
			possibleCountries: ['France'],
		},
		final: { grapeVariety: 'Pinot Noir', countryOfOrigin: 'France', qualityLevel: '', vintage: '2019' },
	},
	notes: 'Classic Côte de Nuits.',
	photoKey: null,
};

const parse = (body: unknown) => tastingCreateSchema.safeParse(body);
const firstMessage = (body: unknown) => {
	const result = parse(body);
	return result.success ? null : result.error.issues[0].message;
};

describe('tastingCreateSchema', () => {
	it('accepts a full tasting as the app sends it', () => {
		expect(parse(fullTasting).success).toBe(true);
	});

	it('accepts the smallest possible tasting', () => {
		expect(parse({ wineType: 'White' }).success).toBe(true);
	});

	it('drops client-only fields rather than storing them', () => {
		const result = parse(fullTasting);
		expect(result.success && 'timerEndsAt' in result.data).toBe(false);
		expect(result.success && 'furthestPhase' in result.data).toBe(false);
	});

	it('requires a red or white wine type', () => {
		expect(firstMessage({})).toBe('Wine type is required');
		expect(firstMessage({ wineType: 'Rosé' })).toBe('Wine type is required');
	});

	it.each([
		['a fractional timer', { timerSeconds: 7.5 }, 'Timer length must be whole seconds'],
		['a timer given as text', { timerSeconds: '240' }, 'Expected number, received string'],
		['an unknown timer mode', { timerMode: 'turbo' }, undefined],
		['a sight answer that is a number', { sight: { Clarity: 3 } }, undefined],
		['a nose answer that is not a list', { nose: { 'Red Fruit': 'Cherry' } }, undefined],
		['notes that are far too long', { notes: 'x'.repeat(5001) }, 'Notes must be 5000 characters or fewer'],
		[
			'a phase stuffed with answers',
			{ palate: Object.fromEntries([...Array(81)].map((_, i) => [`k${i}`, 'x'])) },
			'Too many answers in one phase',
		],
	])('rejects %s', (_label, fields, message) => {
		const result = parse({ wineType: 'Red', ...fields });
		expect(result.success).toBe(false);
		if (message) {
			expect(firstMessage({ wineType: 'Red', ...fields })).toBe(message);
		}
	});
});
