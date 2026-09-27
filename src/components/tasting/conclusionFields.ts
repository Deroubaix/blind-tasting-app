// Conclusion field definitions, plus the answered-counts both the phase pages
// (for their own progress percentage) and the sidebar (for completion) read.
// One definition each, so a phase cannot report 100% while the sidebar disagrees.

import { type TastingData } from '../../types/TastingData';

type InitialConclusion = NonNullable<NonNullable<TastingData['conclusion']>['initial']>;

// 2024 CMS Americas grid. Old/New World is gone from the initial conclusion, and quality level
// and style category are "where appropriate", so neither counts toward a complete final call.
export const IC_REQUIRED_COUNT = 4;
export const FC_REQUIRED = ['grapeVariety', 'countryOfOrigin', 'regionAppellation', 'vintage'];

export const CLIMATES = ['Cool', 'Moderate', 'Warm'];
export const AGE_RANGES = ['1-3 years', '3-5 years', '5-10 years', '10 years+'];
export const QUALITY_LEVELS = [
	'Village',
	'Premier Cru',
	'Grand Cru',
	'Reserva',
	'Gran Reserva',
	'Normale',
	'Riserva',
	'Classico',
	'Gran Selezione',
	'Kabinett',
	'Spätlese',
	'Auslese',
	'Other',
];
export const STYLE_CATEGORIES = ['Trocken', 'Sec', 'Demi-Sec', 'Moelleux', 'Aszú', 'VT', 'SGN', 'Other'];

export function icAnsweredCount(ic: Partial<InitialConclusion> | undefined): number {
	if (!ic) {
		return 0;
	}
	return [
		ic.climate,
		ic.ageRange,
		(ic.grapeVarieties?.length ?? 0) > 0 ? 'x' : null,
		(ic.possibleCountries?.length ?? 0) > 0 ? 'x' : null,
	].filter(Boolean).length;
}

export function fcAnsweredCount(fc: Record<string, string | null> | undefined): number {
	return FC_REQUIRED.filter((key) => Boolean(fc?.[key])).length;
}
