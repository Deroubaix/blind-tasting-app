import { describe, expect, it } from 'vitest';
import { formatMonthYear, formatShortDate } from './DateUtils';
import { formatDecimal } from './NumberUtils';

const date = '2026-11-04T12:00:00Z';

describe('date and number formats', () => {
	it('writes a short date each language’s way', () => {
		expect(formatShortDate(date, 'en', 'UTC')).toBe('Nov 4');
		expect(formatShortDate(date, 'pt', 'UTC')).toBe('4 nov.');
	});

	it('writes a month and year', () => {
		expect(formatMonthYear(date, 'en', 'UTC')).toBe('November 2026');
		expect(formatMonthYear(date, 'pt', 'UTC')).toBe('novembro de 2026');
	});

	it('uses a decimal comma in Portuguese', () => {
		expect(formatDecimal(3.5, 'en')).toBe('3.5');
		expect(formatDecimal(3.5, 'pt')).toBe('3,5');
		expect(formatDecimal(4, 'pt')).toBe('4,0');
	});
});
