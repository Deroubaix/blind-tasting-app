import { describe, expect, it } from 'vitest';
import {
	CODE_ALPHABET,
	average,
	compareStructure,
	entryStatus,
	formatCode,
	newFlightCode,
	normaliseCode,
	structureAttributes,
} from './flightLogic';

describe('flight codes', () => {
	it('are six characters with no look-alikes', () => {
		const code = newFlightCode();
		expect(code).toHaveLength(6);
		expect(code.split('').every((ch) => CODE_ALPHABET.includes(ch))).toBe(true);
		expect(CODE_ALPHABET).not.toMatch(/[01OIL]/);
	});

	it('read back whatever the taster typed', () => {
		expect(normaliseCode(' b7k-q4m ')).toBe('B7KQ4M');
		expect(formatCode('B7KQ4M')).toBe('B7K·Q4M');
	});
});

describe('entryStatus', () => {
	it('follows a taster through a wine', () => {
		expect(entryStatus(undefined, false)).toBe('notstarted');
		expect(entryStatus({ tastingId: null }, false)).toBe('tasting');
		expect(entryStatus({ tastingId: 't1' }, false)).toBe('submitted');
	});

	it('shows anyone unfinished at the reveal as not submitted, never zero', () => {
		expect(entryStatus({ tastingId: null }, true)).toBe('notsubmitted');
		expect(entryStatus(undefined, true)).toBe('notsubmitted');
		expect(entryStatus({ tastingId: 't1' }, true)).toBe('submitted');
	});
});

describe('average', () => {
	it('leaves out those who did not submit', () => {
		expect(average([4, 3, 0, null])).toBe(2.3);
		expect(average([null, null])).toBeNull();
	});
});

describe('compareStructure', () => {
	const call = (personId: string, value: string) => ({
		personId,
		wineType: 'red' as const,
		palate: { 'Tannin Volume': value },
	});

	it('marks a two-step spread as a split', () => {
		const result = compareStructure('Tannin Volume', [
			call('m', 'Medium−'),
			call('j', 'Medium'),
			call('p', 'High'),
		]);
		expect(result?.agreement).toBe('split');
		expect(result?.phrase).toBe('Spread from Medium− to High');
	});

	it('words agreement and near misses', () => {
		expect(compareStructure('Tannin Volume', [call('m', 'Medium'), call('j', 'Medium')])?.phrase).toBe(
			'Both said Medium',
		);
		const near = compareStructure('Tannin Volume', [call('m', 'Medium+'), call('j', 'Medium+'), call('p', 'High')]);
		expect(near?.agreement).toBe('near');
		expect(near?.phrase).toBe('Two said Medium+, one said High');
	});

	it('skips tasters who left it blank', () => {
		expect(compareStructure('Tannin Volume', [{ personId: 'x', wineType: 'red', palate: {} }])).toBeNull();
	});

	it('compares tannin only when someone called the wine red', () => {
		expect(structureAttributes(['white', 'white'])).not.toContain('Tannin Volume');
		expect(structureAttributes(['white', 'red'])).toContain('Tannin Volume');
	});
});
