import { describe, expect, it } from 'vitest';
import { matchSuggestions, resolveEnter } from './autocompleteMatch';

const GRAPES = ['Carménère', 'Cabernet Franc', 'Cabernet Sauvignon', 'Grüner Veltliner', 'Pinot Noir'];

describe('matchSuggestions', () => {
	it('ignores accents and case', () => {
		expect(matchSuggestions('carmenere', GRAPES)).toEqual(['Carménère']);
		expect(matchSuggestions('GRUNER', GRAPES)).toEqual(['Grüner Veltliner']);
	});

	it('shows nothing until something is typed', () => {
		expect(matchSuggestions('  ', GRAPES)).toEqual([]);
	});
});

describe('resolveEnter', () => {
	it('takes the only matching suggestion', () => {
		expect(resolveEnter('carm', GRAPES)).toBe('Carménère');
	});

	it('takes the listed spelling of an exact match', () => {
		expect(resolveEnter('pinot noir', GRAPES)).toBe('Pinot Noir');
	});

	it('keeps the typing when it could mean more than one thing', () => {
		expect(resolveEnter('cabernet', GRAPES)).toBe('cabernet');
	});

	it('keeps a name that is not on the list', () => {
		expect(resolveEnter('  Xarel·lo ', GRAPES)).toBe('Xarel·lo');
	});
});
