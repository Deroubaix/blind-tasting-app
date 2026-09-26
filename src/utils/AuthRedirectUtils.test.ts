import { describe, expect, it } from 'vitest';
import { isSavingTasting } from './AuthRedirectUtils';

describe('isSavingTasting', () => {
	it('recognises the return path the save page sends', () => {
		expect(isSavingTasting('/tastings/save?wineType=red&autoSave=1')).toBe(true);
	});

	it('does not claim other return paths', () => {
		expect(isSavingTasting('/archives')).toBe(false);
		expect(isSavingTasting('/tastings/palate?wineType=red')).toBe(false);
	});
});
