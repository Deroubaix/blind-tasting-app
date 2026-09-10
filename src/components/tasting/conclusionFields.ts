// Conclusion field definitions, plus the answered-counts both the phase pages
// (for their own progress percentage) and the sidebar (for completion) read.
// One definition each, so a phase cannot report 100% while the sidebar disagrees.

import { type TastingData } from '../../types/TastingData';

type InitialConclusion = NonNullable<NonNullable<TastingData['conclusion']>['initial']>;

export const IC_REQUIRED_COUNT = 5;
export const FC_REQUIRED = ['grapeVariety', 'countryOfOrigin', 'regionAppellation', 'qualityLevel', 'vintage'];

export function icAnsweredCount(ic: Partial<InitialConclusion> | undefined): number {
	if (!ic) {
		return 0;
	}
	return [
		ic.worldOrigin,
		ic.climate,
		ic.ageRange,
		(ic.grapeVarieties?.length ?? 0) > 0 ? 'x' : null,
		(ic.possibleCountries?.length ?? 0) > 0 ? 'x' : null,
	].filter(Boolean).length;
}

export function fcAnsweredCount(fc: Record<string, string | null> | undefined): number {
	return FC_REQUIRED.filter((key) => Boolean(fc?.[key])).length;
}
