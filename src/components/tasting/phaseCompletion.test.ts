import { describe, expect, it } from 'vitest';
import { PHASE_ORDER, advanceFurthestPhase, phaseComplete, phaseIndex } from './phaseCompletion';

// furthestPhase is the index into PHASE_ORDER of the furthest page reached.
const reached = (path: string) => ({ furthestPhase: phaseIndex(path) });

describe('phaseComplete', () => {
	it('completes nothing at the start of a tasting', () => {
		for (const path of PHASE_ORDER) {
			expect(phaseComplete(path, {})).toBe(false);
		}
	});

	it('completes the phases behind you, not the one you are on', () => {
		const data = reached('/tastings/palate');

		expect(phaseComplete('/tastings/sight', data)).toBe(true);
		expect(phaseComplete('/tastings/nose', data)).toBe(true);
		expect(phaseComplete('/tastings/palate', data)).toBe(false);
		expect(phaseComplete('/tastings/initial-conclusion', data)).toBe(false);
	});

	it('completes all five phases once you reach Save', () => {
		const data = reached('/tastings/save');

		for (const path of PHASE_ORDER.slice(0, 5)) {
			expect(phaseComplete(path, data)).toBe(true);
		}
	});

	it('never completes a page that is not a phase', () => {
		expect(phaseComplete('/archives', reached('/tastings/save'))).toBe(false);
	});
});

describe('advanceFurthestPhase', () => {
	it('moves forward as you advance', () => {
		let furthest = 0;
		furthest = advanceFurthestPhase(furthest, '/tastings/nose');
		furthest = advanceFurthestPhase(furthest, '/tastings/palate');

		expect(furthest).toBe(phaseIndex('/tastings/palate'));
	});

	it('is a high-water mark: stepping back does not un-complete later phases', () => {
		const atPalate = phaseIndex('/tastings/palate');
		const afterGoingBack = advanceFurthestPhase(atPalate, '/tastings/sight');

		expect(afterGoingBack).toBe(atPalate);
		expect(phaseComplete('/tastings/nose', { furthestPhase: afterGoingBack })).toBe(true);
	});

	it('ignores pages that are not phases', () => {
		const atNose = phaseIndex('/tastings/nose');

		expect(advanceFurthestPhase(atNose, '/archives')).toBe(atNose);
	});
});
