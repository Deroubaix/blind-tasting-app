import { describe, expect, it } from 'vitest';
import { isSavingTasting, safeRedirect } from './AuthRedirectUtils';

describe('isSavingTasting', () => {
	it('recognises the return path the save page sends', () => {
		expect(isSavingTasting('/tastings/save?wineType=red&autoSave=1')).toBe(true);
	});

	it('does not claim other return paths', () => {
		expect(isSavingTasting('/archives')).toBe(false);
		expect(isSavingTasting('/tastings/palate?wineType=red')).toBe(false);
	});
});

describe('safeRedirect', () => {
	it('keeps a path inside the app, query and all', () => {
		expect(safeRedirect('/tastings/save?wineType=red&autoSave=1')).toBe('/tastings/save?wineType=red&autoSave=1');
		expect(safeRedirect('/archives/abc#top')).toBe('/archives/abc#top');
	});

	it('falls back to the archive with no return path', () => {
		expect(safeRedirect(null)).toBe('/archives');
		expect(safeRedirect('')).toBe('/archives');
	});

	it.each([
		'https://evil.site',
		'//evil.site',
		'/\\evil.site',
		'/\t/evil.site',
		'\\\\evil.site',
		'javascript:alert(1)',
		'evil.site',
		'https://app.invalid/archives',
	])('refuses to leave the app for %j', (returnTo) => {
		expect(safeRedirect(returnTo)).toBe('/archives');
	});
});
