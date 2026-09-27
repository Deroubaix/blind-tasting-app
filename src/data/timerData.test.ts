import { describe, expect, it } from 'vitest';
import { TIMER_PRESETS, type TimerPhase, formatTimerSeconds, phaseSeconds } from './timerData';

const PHASES: TimerPhase[] = ['sight', 'nose', 'palate', 'initialConclusion', 'finalConclusion'];

describe('TIMER_PRESETS', () => {
	it('matches the exam paces: Advanced/Master 4:00 and Certified 11:15', () => {
		expect(TIMER_PRESETS.map((p) => formatTimerSeconds(p.seconds))).toEqual(['4:00', '11:15']);
	});
});

describe('phaseSeconds', () => {
	it.each(TIMER_PRESETS.map((p) => p.seconds))('splits %i seconds so the phases add up exactly', (total) => {
		expect(PHASES.reduce((sum, phase) => sum + phaseSeconds(total, phase), 0)).toBe(total);
	});

	it('keeps the 4-minute split students already know', () => {
		expect(PHASES.map((phase) => phaseSeconds(240, phase))).toEqual([30, 120, 30, 30, 30]);
	});

	it('gives the nose half of the Certified time', () => {
		expect(phaseSeconds(675, 'nose')).toBe(339);
		expect(phaseSeconds(675, 'sight')).toBe(84);
	});
});
