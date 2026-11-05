import { describe, expect, it } from 'vitest';
import { dict, langOf } from './index';

describe('langOf', () => {
	it('accepts only the supported codes and falls back to English', () => {
		expect(langOf('pt')).toBe('pt');
		expect(langOf('en')).toBe('en');
		expect(langOf('fr')).toBe('en');
		expect(langOf(undefined)).toBe('en');
	});
});

describe('dict', () => {
	it('keeps both halves and lets functions take arguments', () => {
		const d = dict(
			{ hello: 'Hello', wine: (n: number) => `Wine ${n}`, nested: { yes: 'Yes' } },
			{ hello: 'Olá', wine: (n: number) => `Vinho ${n}`, nested: { yes: 'Sim' } },
		);
		expect(d.en.wine(2)).toBe('Wine 2');
		expect(d.pt.wine(2)).toBe('Vinho 2');
		expect(d.pt.nested.yes).toBe('Sim');
	});
});
