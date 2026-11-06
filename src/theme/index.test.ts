import { describe, expect, it } from 'vitest';
import { themeColorMetas, themeOf } from './index';

describe('themeOf', () => {
	it('keeps a known theme', () => {
		expect(themeOf('light')).toBe('light');
		expect(themeOf('dark')).toBe('dark');
		expect(themeOf('auto')).toBe('auto');
	});

	it('falls back to light for anything else', () => {
		expect(themeOf(undefined)).toBe('light');
		expect(themeOf('')).toBe('light');
		expect(themeOf('sepia')).toBe('light');
	});
});

describe('themeColorMetas', () => {
	it('gives one colour for an explicit choice and one per system setting for auto', () => {
		expect(themeColorMetas('light')).toEqual([{ content: '#f5efe4' }]);
		expect(themeColorMetas('dark')).toEqual([{ content: '#1c1816' }]);
		expect(themeColorMetas('auto').map((m) => m.media)).toEqual([
			'(prefers-color-scheme: light)',
			'(prefers-color-scheme: dark)',
		]);
	});
});
