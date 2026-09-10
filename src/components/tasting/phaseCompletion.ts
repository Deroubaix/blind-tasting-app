// A phase is complete once you have moved past it. Not "has any answer" (green on the
// first click) and not "has every answer" — leaving an attribute blank is a legitimate
// answer, so advancing is the only signal that means the taster considers it finished.

import { type TastingData } from '../../types/TastingData';

// Save is the step past the last phase, so reaching it completes them all.
export const PHASE_ORDER = [
	'/tastings/sight',
	'/tastings/nose',
	'/tastings/palate',
	'/tastings/initial-conclusion',
	'/tastings/final-conclusion',
	'/tastings/save',
];

export function phaseIndex(pathname: string): number {
	return PHASE_ORDER.indexOf(pathname);
}

export function phaseComplete(href: string, tastingData: Partial<TastingData>): boolean {
	const index = phaseIndex(href);
	return index >= 0 && index < (tastingData.furthestPhase ?? 0);
}
